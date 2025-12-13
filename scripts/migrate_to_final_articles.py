from pymongo import MongoClient
from bson.objectid import ObjectId
from bs4 import BeautifulSoup
from dateutil import parser
import re
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env.local or .env
load_dotenv('.env.local')
load_dotenv('.env')

# ==========================================
# CONFIGURATION
# ==========================================
# CHANGE THIS TO TRUE ONLY AFTER VERIFYING THE DATA IS CORRECT
DELETE_OLD_COLLECTIONS = False 

# Get MongoDB connection string from environment or use default
# The script will check .env.local first, then .env, then environment variables
MONGO_URI = os.getenv('DATABASE_URL', 'mongodb://localhost:27017/')
DB_NAME = 'ARTICLES'  # Based on your mongodb.js file - CHANGE IF DIFFERENT

# If DATABASE_URL contains the database name, extract it
if '/' in MONGO_URI and MONGO_URI.count('/') >= 3:
    # MongoDB URI format: mongodb://user:pass@host:port/dbname?options
    parts = MONGO_URI.split('/')
    if len(parts) >= 4:
        db_part = parts[3].split('?')[0]  # Remove query parameters
        if db_part:
            DB_NAME = db_part
            # Remove database name from URI
            MONGO_URI = '/'.join(parts[:3]) + '/' + '?'.join(parts[3].split('?')[1:]) if '?' in parts[3] else '/'.join(parts[:3])

print(f"\nConnecting to MongoDB...")
print(f"URI: {MONGO_URI[:50]}..." if len(MONGO_URI) > 50 else f"URI: {MONGO_URI}")
print(f"Database: {DB_NAME}")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Test connection
    client.admin.command('ping')
    print("[OK] Connected to MongoDB successfully")
except Exception as e:
    print(f"[ERROR] Failed to connect to MongoDB: {e}")
    print("\nPlease check:")
    print("1. Is DATABASE_URL set in your environment?")
    print("2. Is MongoDB running (if using localhost)?")
    print("3. Is the connection string correct?")
    exit(1)

db = client[DB_NAME]

# List all collections in the database
print(f"\nAvailable collections in '{DB_NAME}':")
collections = db.list_collection_names()
for col in collections:
    count = db[col].count_documents({})
    print(f"  - {col}: {count} documents")
print()

# Source Collections
col_messy_html = db['Article']   
col_messy_arrays = db['Articles']  
col_messy_topics = db['Topic'] # The collection that had articles nested inside it

# Destination Collection
target_col = db['final_articles']

# Tracker for Deduplication
seen_titles = set()

# Helper: Find Topic ID based on name (if needed)
def get_topic_id(topic_name):
    if not topic_name: return None
    # Check if there's a topics collection, otherwise return None
    try:
        topics_col = db['topics']
        topic = topics_col.find_one({"name": {"$regex": f"^{re.escape(topic_name)}$", "$options": "i"}})
        return topic['_id'] if topic else None
    except:
        return None

print("=" * 60)
print("Starting Migration & Cleanup...")
print(f"Database: {DB_NAME}")
print(f"Target Collection: final_articles")
print(f"Delete Old Collections: {DELETE_OLD_COLLECTIONS}")
print("=" * 60)

# Clear target collection to start fresh (Optional, but recommended for testing)
print("\nClearing target collection...")
target_col.delete_many({})
print("Target collection cleared.")

# ======================================================
# FUNCTION: PROCESS A DOCUMENT
# ======================================================
def process_and_insert(doc, source_type):
    try:
        # 1. DEDUPLICATION CHECK
        title = doc.get('title', '')
        if not title: 
            return # Skip documents with no title
        
        # Normalize title (lowercase, remove extra spaces) to find duplicates
        norm_title = title.strip().lower()
        
        if norm_title in seen_titles:
            print(f"  Skipping Duplicate: {title[:50]}...")
            return
        
        # Add to seen set
        seen_titles.add(norm_title)

        # 2. CONTENT CLEANING
        html_string = ""
        hero_image = None
        filtered_images = []
        
        # LOGIC FOR MESSY HTML COLLECTION
        if source_type == "html_source":
            raw_html = doc.get('content', '')
            if raw_html:
                if isinstance(raw_html, str):
                    soup = BeautifulSoup(raw_html, "html.parser")
                    # Extract all images
                    img_tags = soup.find_all('img')
                    for img in img_tags:
                        img_src = img.get('src')
                        if img_src:
                            if img_src not in filtered_images:
                                filtered_images.append(img_src)
                            if not hero_image:
                                hero_image = img_src
                    # Remove images from content
                    for img in img_tags:
                        img.decompose()
                    html_string = str(soup)
                else:
                    html_string = str(raw_html)
                
        # LOGIC FOR MESSY ARRAY COLLECTION
        elif source_type == "array_source":
            content_array = doc.get('content', [])
            if isinstance(content_array, list):
                for block in content_array:
                    if isinstance(block, dict):
                        if block.get('heading'):
                            html_string += f"<h2>{block.get('heading')}</h2>"
                        paras = block.get('paragraphs', [])
                        if isinstance(paras, list):
                            for p in paras:
                                if p: html_string += f"<p>{p}</p>"
                        elif isinstance(paras, str):
                            html_string += f"<p>{paras}</p>"
                    elif isinstance(block, str):
                        html_string += f"<p>{block}</p>"
            
            # Get filtered_images from Articles collection
            filtered_images = doc.get('filtered_images', [])
            if filtered_images and isinstance(filtered_images, list) and len(filtered_images) > 0:
                hero_image = filtered_images[0]

        # LOGIC FOR TOPIC COLLECTION (nested articles)
        elif source_type == "topic_source":
            # Topic collection has articles nested inside
            content_array = doc.get('content', [])
            if isinstance(content_array, list):
                for block in content_array:
                    if isinstance(block, dict):
                        if block.get('heading'):
                            html_string += f"<h2>{block.get('heading')}</h2>"
                        paras = block.get('paragraphs', [])
                        if isinstance(paras, list):
                            for p in paras:
                                if p: html_string += f"<p>{p}</p>"
                        elif isinstance(paras, str):
                            html_string += f"<p>{paras}</p>"
                    elif isinstance(block, str):
                        html_string += f"<p>{block}</p>"
            
            filtered_images = doc.get('filtered_images', [])
            if filtered_images and isinstance(filtered_images, list) and len(filtered_images) > 0:
                hero_image = filtered_images[0]

        # 3. DATE PARSING - Normalize to ISO format
        date_val = doc.get('date') or doc.get('createdAt') or doc.get('published_at')
        iso_date = None
        date_string = None
        
        if date_val:
            try:
                if isinstance(date_val, str):
                    # Try parsing the string date
                    parsed_date = parser.parse(date_val, fuzzy=True)
                    iso_date = parsed_date
                    date_string = parsed_date.strftime("%b %d, %Y")  # Human-readable format
                elif isinstance(date_val, datetime):
                    iso_date = date_val
                    date_string = date_val.strftime("%b %d, %Y")
                else:
                    iso_date = date_val
            except Exception as e:
                print(f"    Warning: Could not parse date '{date_val}': {e}")
                # Use current date as fallback
                iso_date = datetime.now()
                date_string = iso_date.strftime("%b %d, %Y")
        else:
            # No date found, use current date
            iso_date = datetime.now()
            date_string = iso_date.strftime("%b %d, %Y")

        # 4. TOPIC HANDLING
        t_name = doc.get('topic') or doc.get('topic_name')
        t_id = doc.get('topicId') or doc.get('topic_id')
        
        # If we have a name but no ID, try to find it
        if t_name and not t_id:
            t_id = get_topic_id(t_name)

        # 5. CONSTRUCT FINAL DOCUMENT
        new_doc = {
            "_id": doc.get('_id'),  # Keep original ID
            "title": title.strip(),
            "description": doc.get('description', ''),
            "content": html_string,
            "hero_image": hero_image,
            "filtered_images": filtered_images if filtered_images else [],
            "date": date_string,  # Human-readable format for display
            "published_at": iso_date,  # ISO format for sorting
            "author": doc.get('author', ''),
            "topic": t_name or '',
            "topic_id": t_id,
            "created_at": datetime.now(),
            "source": source_type,  # Track where it came from
        }
        
        # Remove None values
        new_doc = {k: v for k, v in new_doc.items() if v is not None}
        
        target_col.insert_one(new_doc)
        print(f"  [OK] Inserted: {title[:50]}...")
        
    except Exception as e:
        print(f"  [ERROR] Error processing {doc.get('_id')}: {e}")
        import traceback
        traceback.print_exc()

# ======================================================
# RUN MIGRATION
# ======================================================

print("\n" + "=" * 60)
print("Processing Collection: Article (HTML Source)...")
print("=" * 60)
count_html = 0
for doc in col_messy_html.find({}):
    process_and_insert(doc, "html_source")
    count_html += 1
print(f"Processed {count_html} documents from Article collection")

print("\n" + "=" * 60)
print("Processing Collection: Articles (Array Source)...")
print("=" * 60)
count_arrays = 0
for doc in col_messy_arrays.find({}):
    process_and_insert(doc, "array_source")
    count_arrays += 1
print(f"Processed {count_arrays} documents from Articles collection")

print("\n" + "=" * 60)
print("Processing Collection: Topic (Nested Articles)...")
print("=" * 60)
count_topics = 0
for topic_doc in col_messy_topics.find({}):
    articles = topic_doc.get('articles', [])
    if isinstance(articles, list):
        for article_doc in articles:
            # Add topic info to article
            article_doc['topic'] = topic_doc.get('name') or topic_doc.get('title', '')
            article_doc['topicId'] = topic_doc.get('_id')
            process_and_insert(article_doc, "topic_source")
            count_topics += 1
print(f"Processed {count_topics} articles from Topic collection")

print("\n" + "=" * 60)
final_count = target_col.count_documents({})
print(f"Migration Complete!")
print(f"Total unique articles in final_articles: {final_count}")
print(f"  - From Article: {count_html}")
print(f"  - From Articles: {count_arrays}")
print(f"  - From Topic: {count_topics}")
print("=" * 60)

# ======================================================
# CLEANUP (DELETING OLD COLLECTIONS)
# ======================================================
if DELETE_OLD_COLLECTIONS:
    print("\n" + "!" * 60)
    print("!!! DELETING OLD COLLECTIONS !!!")
    print("!" * 60)
    
    # 1. Delete 'Article'
    if 'Article' in db.list_collection_names():
        col_messy_html.drop()
        print("[OK] Dropped collection: Article")
    
    # 2. Delete 'Articles'
    if 'Articles' in db.list_collection_names():
        col_messy_arrays.drop()
        print("[OK] Dropped collection: Articles")
    
    # 3. Delete 'Topic' (The one with nested articles)
    # BE CAREFUL: Only delete this if you have a separate, clean 'topics' 
    # collection for your frontend menu. If this was your ONLY list of topics,
    # you might want to keep it (but remove the nested articles inside it).
    if 'Topic' in db.list_collection_names():
        col_messy_topics.drop() 
        print("[OK] Dropped collection: Topic")
    
    print("\n" + "=" * 60)
    print("Cleanup Successful.")
    print("=" * 60)
else:
    print("\n" + "-" * 60)
    print("--- SAFETY CHECK ---")
    print("Old collections were NOT deleted.")
    print("Please inspect 'final_articles' collection.")
    print("If it looks good, set DELETE_OLD_COLLECTIONS = True and run again.")
    print("-" * 60)

print("\nScript completed!")

