// import React from "react";
// import styles from "./categoryList.module.css";
// import Link from "next/link";
// import Image from "next/image";

// const getData = async () => {
//   const response = await fetch("http:localhost:3000/api/categories", {
//     cache: "no-store",
//   });

//   if (!response.ok) {
//     throw new Error("failed");
//   }

//   return response.json();
// };
// const CategoryList = async () => {
//   const data = await getData();
//   return (
//     <div className={styles.container}>
//       <h1 className={styles.title}>Popular Categories</h1>
//       <div className={styles.categories}>
//         {data?.map((item) => (
//           <Link
//             href="/blog?cat=style"
//             className={`${styles.category} ${styles[item.slug]}`}
//             key={item._id}
//           >
//             {item.img && <Image
//               src={item.img}
//               alt=""
//               height={32}
//               width={32}
//               className={styles.image}
//             />}
//             {item.title}
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CategoryList;

import React from "react";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";

// Flag to disable fetching
const shouldFetchData = false; // Set this to true when you want to fetch data

const getData = async () => {
  // Skip fetch data if the flag is set to false
  if (!shouldFetchData) {
    return []; // Fallback data
  }

  const response = await fetch("http://localhost:3000/api/categories", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
};

const CategoryList = async () => {
  let data = [];

  // Try to fetch data if the flag allows it
  try {
    data = await getData();
  } catch (error) {
    console.error(error);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Recent Posts</h1>
      <div className={styles.categories}>
        {data.length > 0 ? (
          data.map((item) => (
            <Link
              href={`/blog?cat=${item.slug}`}
              className={`${styles.category} ${styles[item.slug]}`}
              key={item._id}
            >
              {item.img && (
                <Image
                  src={item.img}
                  alt=""
                  height={32}
                  width={32}
                  className={styles.image}
                />
              )}
              {item.title}
            </Link>
          ))
        ) : (
          <p>No categories available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
