import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVL3NTK9y_4O1PMfH3oSwixugIJPkmXfg",
  authDomain: "asmita-gruh-udhyog.firebaseapp.com",
  projectId: "asmita-gruh-udhyog",
  storageBucket: "asmita-gruh-udhyog.firebasestorage.app",
  messagingSenderId: "1047678886165",
  appId: "1:1047678886165:web:22daf2f4623f770884891c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const password = process.argv[2];
if (!password) {
  console.error("❌ Usage: node delete-products.mjs YOUR_PASSWORD");
  process.exit(1);
}

async function deleteAllProducts() {
  console.log("🔑 Signing in...");
  await signInWithEmailAndPassword(auth, "manavpatel121213@gmail.com", password);
  console.log("✅ Signed in!\n");

  const snapshot = await getDocs(collection(db, "products"));
  if (snapshot.empty) {
    console.log("ℹ️  No products found in Firestore.");
    process.exit(0);
  }

  console.log(`🗑️  Deleting ${snapshot.size} products...\n`);
  let count = 0;
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, "products", docSnap.id));
    console.log(`  ✅ Deleted: ${docSnap.data().name || docSnap.id}`);
    count++;
  }

  console.log(`\n🎉 Done! ${count} products deleted from Firestore.`);
  process.exit(0);
}

deleteAllProducts().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
