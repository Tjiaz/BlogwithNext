# MongoDB Shell: Delete AI/ML Articles

## Delete All Listed Articles

```javascript
db.final_articles.deleteMany({
  title: {
    $in: [
      "Building Surveillance System Using USB Camera and Wireless-Connected Raspberry Pi",
      "Pedestrian Detection in Aerial Images Using RetinaNet",
      "Training a Champion: Building Deep Neural Nets for Big Data Analytics",
      "Auto Rotate Images Using Deep Learning",
      "A Beginner's Guide to the CLIP Model",
      "Understanding BERT with Hugging Face",
      "Training BPE, WordPiece, and Unigram Tokenizers from Scratch using Hugging Face",
      "Key-Value Databases, Explained",
      "Multimodal Grounded Learning with Vision and Language",
      "GPT-Engineer: Your New AI Coding Assistant",
      "I Created An AI App In 3 Days",
      "Tailor ChatGPT to Fit Your Needs with Custom Instructions",
      "How to Use ChatGPT to Convert Text into a PowerPoint Presentation",
      "Who Will Make Money from the Generative AI Gold Rush?",
      "If You Want to Master Generative AI, Ignore All (But Two) Tools",
      "Meet MetaGPT: The ChatGPT-Powered AI Assistant That Turns Text Into Web Apps",
      "Traditional AI vs Generative AI",
      "Gartner Hype Cycle for AI in 2023",
      "Beyond Skynet: Crafting the Next Frontier in AI Evolution",
      "40% of Labour Force Will be Affected by AI in 3 Years",
      "AI + No-Code: The Viral Combo Redefining Developer Innovation",
      "Personalized AI Made Simple: Your No-Code Guide to Adapting GPTs",
      "AI in Intimate Roles: Girlfriends and Therapists",
      "5 Use Cases of DALLE-3",
      "AI-Automated Cybersecurity: What to Automate?",
      "Free AI Courses from NVIDIA: For All Levels",
      "A Simple to Implement End-to-End Project with HuggingFace",
      "The Role of AI in Digital Marketing",
      "Masked Arrays in NumPy to Handle Missing Data",
    ],
  },
});
```

## Single Line Version (Copy-Paste Friendly)

```javascript
db.final_articles.deleteMany({
  title: {
    $in: [
      "Building Surveillance System Using USB Camera and Wireless-Connected Raspberry Pi",
      "Pedestrian Detection in Aerial Images Using RetinaNet",
      "Training a Champion: Building Deep Neural Nets for Big Data Analytics",
      "Auto Rotate Images Using Deep Learning",
      "A Beginner's Guide to the CLIP Model",
      "Understanding BERT with Hugging Face",
      "Training BPE, WordPiece, and Unigram Tokenizers from Scratch using Hugging Face",
      "Key-Value Databases, Explained",
      "Multimodal Grounded Learning with Vision and Language",
      "GPT-Engineer: Your New AI Coding Assistant",
      "I Created An AI App In 3 Days",
      "Tailor ChatGPT to Fit Your Needs with Custom Instructions",
      "How to Use ChatGPT to Convert Text into a PowerPoint Presentation",
      "Who Will Make Money from the Generative AI Gold Rush?",
      "If You Want to Master Generative AI, Ignore All (But Two) Tools",
      "Meet MetaGPT: The ChatGPT-Powered AI Assistant That Turns Text Into Web Apps",
      "Traditional AI vs Generative AI",
      "Gartner Hype Cycle for AI in 2023",
      "Beyond Skynet: Crafting the Next Frontier in AI Evolution",
      "40% of Labour Force Will be Affected by AI in 3 Years",
      "AI + No-Code: The Viral Combo Redefining Developer Innovation",
      "Personalized AI Made Simple: Your No-Code Guide to Adapting GPTs",
      "AI in Intimate Roles: Girlfriends and Therapists",
      "5 Use Cases of DALLE-3",
      "AI-Automated Cybersecurity: What to Automate?",
      "Free AI Courses from NVIDIA: For All Levels",
      "A Simple to Implement End-to-End Project with HuggingFace",
      "The Role of AI in Digital Marketing",
      "Masked Arrays in NumPy to Handle Missing Data",
    ],
  },
});
```

## Before Deleting: Check What Will Be Deleted

```javascript
// See which articles match
db.final_articles
  .find({
    title: {
      $in: [
        "Building Surveillance System Using USB Camera and Wireless-Connected Raspberry Pi",
        "Pedestrian Detection in Aerial Images Using RetinaNet",
        "Training a Champion: Building Deep Neural Nets for Big Data Analytics",
        "Auto Rotate Images Using Deep Learning",
        "A Beginner's Guide to the CLIP Model",
        "Understanding BERT with Hugging Face",
        "Training BPE, WordPiece, and Unigram Tokenizers from Scratch using Hugging Face",
        "Key-Value Databases, Explained",
        "Multimodal Grounded Learning with Vision and Language",
        "GPT-Engineer: Your New AI Coding Assistant",
        "I Created An AI App In 3 Days",
        "Tailor ChatGPT to Fit Your Needs with Custom Instructions",
        "How to Use ChatGPT to Convert Text into a PowerPoint Presentation",
        "Who Will Make Money from the Generative AI Gold Rush?",
        "If You Want to Master Generative AI, Ignore All (But Two) Tools",
        "Meet MetaGPT: The ChatGPT-Powered AI Assistant That Turns Text Into Web Apps",
        "Traditional AI vs Generative AI",
        "Gartner Hype Cycle for AI in 2023",
        "Beyond Skynet: Crafting the Next Frontier in AI Evolution",
        "40% of Labour Force Will be Affected by AI in 3 Years",
        "AI + No-Code: The Viral Combo Redefining Developer Innovation",
        "Personalized AI Made Simple: Your No-Code Guide to Adapting GPTs",
        "AI in Intimate Roles: Girlfriends and Therapists",
        "5 Use Cases of DALLE-3",
        "AI-Automated Cybersecurity: What to Automate?",
        "Free AI Courses from NVIDIA: For All Levels",
        "A Simple to Implement End-to-End Project with HuggingFace",
        "The Role of AI in Digital Marketing",
        "Masked Arrays in NumPy to Handle Missing Data",
      ],
    },
  })
  .pretty();
```

## Count How Many Will Be Deleted

```javascript
db.final_articles.countDocuments({
  title: {
    $in: [
      "Building Surveillance System Using USB Camera and Wireless-Connected Raspberry Pi",
      "Pedestrian Detection in Aerial Images Using RetinaNet",
      "Training a Champion: Building Deep Neural Nets for Big Data Analytics",
      "Auto Rotate Images Using Deep Learning",
      "A Beginner's Guide to the CLIP Model",
      "Understanding BERT with Hugging Face",
      "Training BPE, WordPiece, and Unigram Tokenizers from Scratch using Hugging Face",
      "Key-Value Databases, Explained",
      "Multimodal Grounded Learning with Vision and Language",
      "GPT-Engineer: Your New AI Coding Assistant",
      "I Created An AI App In 3 Days",
      "Tailor ChatGPT to Fit Your Needs with Custom Instructions",
      "How to Use ChatGPT to Convert Text into a PowerPoint Presentation",
      "Who Will Make Money from the Generative AI Gold Rush?",
      "If You Want to Master Generative AI, Ignore All (But Two) Tools",
      "Meet MetaGPT: The ChatGPT-Powered AI Assistant That Turns Text Into Web Apps",
      "Traditional AI vs Generative AI",
      "Gartner Hype Cycle for AI in 2023",
      "Beyond Skynet: Crafting the Next Frontier in AI Evolution",
      "40% of Labour Force Will be Affected by AI in 3 Years",
      "AI + No-Code: The Viral Combo Redefining Developer Innovation",
      "Personalized AI Made Simple: Your No-Code Guide to Adapting GPTs",
      "AI in Intimate Roles: Girlfriends and Therapists",
      "5 Use Cases of DALLE-3",
      "AI-Automated Cybersecurity: What to Automate?",
      "Free AI Courses from NVIDIA: For All Levels",
      "A Simple to Implement End-to-End Project with HuggingFace",
      "The Role of AI in Digital Marketing",
      "Masked Arrays in NumPy to Handle Missing Data",
    ],
  },
});
```
