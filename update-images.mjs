import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
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
if (!password) { console.error("Usage: node update-images.mjs PASSWORD"); process.exit(1); }

const imageMap = {
  "Mystic Dhoop Cones": "/products/mystic-dhoop-cones.png",
  "Premium Agarbatti": "/products/premium-agarbatti.png",
  "Sambrani Cups": "/products/sambrani-cups.png",
  "Floral Essences": "/products/floral-essences.png",
  "Camphor (Kapur)": "/products/camphor-kapur.png",
  "Velvet Idol Cloth": "/products/velvet-idol-cloth.png",
  "Natural Attar": "/products/natural-attar.png"
};

async function updateImages() {
  console.log("🔑 Signing in...");
  await signInWithEmailAndPassword(auth, "manavpatel121213@gmail.com", password);
  console.log("✅ Signed in!\n");

  const snapshot = await getDocs(collection(db, "products"));
  let success = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (imageMap[data.name]) {
      await updateDoc(doc(db, "products", docSnap.id), {
        image: imageMap[data.name]
      });
      console.log(`  ✅ Updated image for: "${data.name}"`);
      success++;
    }
  }

  console.log(`\n🎉 Done! ${success} product images updated.`);
  process.exit(0);
}

updateImages().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
