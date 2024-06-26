<template>
  <NavBar />
  <div class="container px-5">
    <div class="container card bg-light mt-5 p-5">
      <h3 class="text-center">What can we help you with?</h3>
      <form @submit.prevent="uploadImage" class="mt-5">
        <div class="mt-3">
          <label for="subject">Subject:</label>
          <input
            class="form-control"
            type="text"
            id="subject"
            v-model="subject"
          />
        </div>
        <div class="mt-4">
          <label for="message">Message:</label>
          <textarea
            class="form-control"
            id="message"
            rows="4"
            cols="50"
            v-model="message"
          ></textarea>
        </div>
        <div class="mt-4">
          <label for="file">Select an image to upload:</label><br />
          <input
            class="form-control"
            type="file"
            id="file"
            @change="handleFileUpload"
          /><br />
        </div>
        <div class="mt-3">
          <button class="btn btn-primary" type="submit">
            <i class="bi bi-send"></i> Submit
          </button>
        </div>
      </form>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import NavBar from "./alumni-navbar.vue";
import {
  uploadBytes,
  getDownloadURL,
  ref as storageRef,
} from "firebase/storage";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db, storage } from "../../firebase/index.js";
import { useRouter } from "vue-router";

let selectedFile = null;
let subject = ref("");
let message = ref("");
let successMessage = ref("");
const router = useRouter();
const userId = computed(() => router.currentRoute.value.query.userId);
const alumniId = computed(() => router.currentRoute.value.query.alumniId);

const handleFileUpload = (event) => {
  selectedFile = event.target.files[0];
};

const uploadImage = async () => {
  if (!selectedFile) return;

  const imageRef = storageRef(storage, `concernsgallery/${selectedFile.name}`);
  await uploadBytes(imageRef, selectedFile);
  const imageUrl = await getDownloadURL(imageRef);

  const userSnapshot = await getDocs(collection(db, "users"));
  const userData = userSnapshot.docs
    .find((doc) => doc.id === userId.value)
    ?.data();
  const userName = `${userData.lName}, ${userData.fName}`;

  await addDoc(collection(db, "concerns"), {
    userId: alumniId.value,
    name: userName,
    subject: subject.value,
    message: message.value,
    date: new Date().toLocaleDateString(),
    url: imageUrl,
  });
  await addDoc(collection(db, "notifications"), {
    userId: alumniId.value,
    name: userName,
    time: new Date(),
    date: new Date().toLocaleDateString(),
    status: "unread",
    for: "administrator",
    type: "concern",
  });

  successMessage.value = "Concern uploaded successfully!";
  subject.value = "";
  message.value = "";
};
</script>

<style>
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
}

.image-container img {
  width: 200px;
  height: 200px;
  margin: 10px;
  object-fit: cover;
}

.success-message {
  color: green;
  margin-top: 10px;
}
</style>
