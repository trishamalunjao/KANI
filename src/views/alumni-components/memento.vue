<template>
  <div class="main">
    <div class="container-fluid p-0">
      <NavBar />
      <div>
        <img
          src="../../assets/images/memento-bg.png"
          alt="Memento"
          style="width: 100vw; height: 300px"
        />
      </div>
      <div class="container-fluid p-0 d-flex">
        <MementoSideBar />
        <div class="main-content">
          <p>
            <button @click="showPostModal" class="btn btn-dark m-2">
              Add Post
            </button>
          </p>
          <div v-if="showModal" class="modal">
            <div class="modal-content container">
              <div
                class="modal-header d-flex justify-content-between align-items-center text-light background-color-brown"
              >
                <span>Select year and event to proceed</span>
                <span class="close" @click="closeModal">&times;</span>
              </div>
              <div class="input-container mt-5 pt-5">
                <label for="schoolYear">Year:</label>
                <select
                  id="schoolYear"
                  v-model="selectedSchoolYear"
                  class="form-control"
                >
                  <option
                    v-for="year in schoolYears"
                    :key="year.id"
                    :value="year.name"
                  >
                    {{ year.name }}
                  </option>
                </select>
              </div>
              <div class="input-container mt-2">
                <label for="event">Event:</label>
                <select id="event" v-model="selectedEvent" class="form-control">
                  <option
                    v-for="event in events"
                    :key="event.id"
                    :value="event.name"
                  >
                    {{ event.name }}
                  </option>
                </select>
              </div>
              <div class="d-flex justify-content-end mt-3">
                <button class="btn btn-secondary m-1" @click="closeModal">
                  Cancel
                </button>
                <button class="btn btn-primary m-1" @click="continueModal">
                  Continue
                </button>
              </div>
            </div>
          </div>

          <div v-if="showImageModal" class="modal">
            <div class="modal-content">
              <div
                class="modal-header d-flex justify-content-between align-items-center text-light background-color-brown"
              >
                <span>Username / Name Here</span>
                <span class="close" @click="closeImageModal">&times;</span>
              </div>
              <div class="d-flex flex-column justify-content-between">
                <div class="modal-main-content-container">
                  <textarea
                    class="form-control mt-2"
                    v-model="caption"
                    placeholder="Enter caption"
                  ></textarea>
                  <input
                    class="form-control mt-2"
                    type="file"
                    multiple
                    @change="uploadImages"
                  />
                  <div
                    v-for="(progress, index) in progressBars"
                    :key="index"
                    class="progress mt-2"
                  >
                    <div
                      class="progress-bar"
                      role="progressbar"
                      :style="{ width: progress + '%' }"
                      :aria-valuenow="progress"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {{ progress }}%
                    </div>
                  </div>
                </div>
                <div class="container mt-3">
                  <button class="btn-post" @click="savePost">Post</button>
                </div>
              </div>
            </div>
          </div>

          <div
            class="d-flex flex-column align-items-center"
            style="height: calc(100vh - 130px); overflow-y: auto"
          >
            <div
              style="width: 400px"
              v-for="post in approvedPosts"
              :key="post.id"
              class="container card p-3 background-color-brown text-light mt-2"
            >
              <h3>{{ post.name }}</h3>
              <h5>{{ post.caption }}</h5>
              <div
                class="d-flex flex-column align-items-center"
                v-for="(imageUrl, index) in post.imageUrls"
                :key="index"
              >
                <img
                  class="m-1"
                  style="width: 300px"
                  v-if="index < 5 || showAllImages"
                  :src="imageUrl"
                  alt="Post Image"
                />
                <button v-else @click="showAllImages = true">
                  View More Images
                </button>
              </div>
              <hr class="pt-1" />
              <p>{{ post.schoolYear }} - {{ post.event }}</p>
              <p>
                Approved on:
                {{ formatApprovalDate(getLatestApprovalDate(post)) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineProps } from "vue";
import NavBar from "./alumni-navbar.vue";
import SideBar from "./alumni-sidebar.vue";
import MementoSideBar from "./memento-sidebar.vue";
import { db, storage } from "../../firebase/index.js";
import { collection, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useRouter } from "vue-router";

const showModal = ref(false);
const showImageModal = ref(false);
const schoolYears = ref([]);
const events = ref([]);
const selectedSchoolYear = ref("");
const selectedEvent = ref("");
const caption = ref("");
const selectedImages = ref([]);
const progressBars = ref([]);
const router = useRouter();
const userId = computed(() => router.currentRoute.value.query.userId);
const alumniId = computed(() => router.currentRoute.value.query.alumniId);
const isImageSelected = computed(() => selectedImages.value.length > 0);
const showAllImages = ref(false);
const posts = ref([]);

// Edited start
// const userData = ref({
//   name: "",
//   email: "",
//   idNumber: "",
//   course: "",
//   classYear: "",
//   phone: "",
//   photoURL: "",
// });

// const fetchUserData = async () => {
//   const userId = router.currentRoute.value.query.userId;
//   const userDocRef = doc(db, "users", userId);
//   const userDocSnap = await getDoc(userDocRef);
//   if (userDocSnap.exists()) {
//     const user = userDocSnap.data();
//     const name = `${user.fName} ${user.mInitial} ${user.lName}`;

//     userData.value = {
//       ...user,
//       name: name.trim(),
//       photoURL: user.profilePicture,
//     };
//     console.log("memento name: " + userData.name);
//   } else {
//     console.log("User not found");
//   }
// };
// fetchUserData();

// Edited End

function showPostModal() {
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function continueModal() {
  showModal.value = false;
  showImageModal.value = true;
}

function closeImageModal() {
  showImageModal.value = false;
  selectedSchoolYear.value = "";
  selectedEvent.value = "";
  caption.value = "";
  selectedImages.value = [];
  progressBars.value = [];
}

function uploadImages(event) {
  for (let i = 0; i < event.target.files.length; i++) {
    const file = event.target.files[i];
    const storageReference = storageRef(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageReference, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBars.value[i] = progress;
      },
      (error) => {
        console.error("Error uploading image:", error);
      },
      () => {
        getDownloadURL(storageReference)
          .then((url) => {
            selectedImages.value.push(url);
            progressBars.value[i] = 100;
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
          });
      }
    );
  }
}

async function savePost() {
  const userSnapshot = await getDocs(collection(db, "users"));
  const userData = userSnapshot.docs
    .find((doc) => doc.id === userId.value)
    ?.data();
  const userName = `${userData.lName}, ${userData.fName}`;

  const post = {
    userId: alumniId.value,
    name: userName,
    schoolYear: selectedSchoolYear.value,
    event: selectedEvent.value,
    caption: caption.value,
    imageUrls: selectedImages.value,
    status: "pending",
    history: [],
  };
  await addDoc(collection(db, "posts"), post);

  const notification = {
    userId: alumniId.value,
    name: userName,
    time: new Date(),
    date: new Date().toLocaleDateString(),
    status: "unread",
    for: "administrator",
  };
  await addDoc(collection(db, "notifications"), notification);

  closeImageModal();
}

const approvedPosts = computed(() => {
  return posts.value
    .filter(
      (post) => post.status === "approved" && post.userId === alumniId.value
    )
    .sort((a, b) => {
      const aLatestTime = a.history.reduce(
        (latest, entry) => (entry.time > latest ? entry.time : latest),
        a.history[0].time
      );
      return new Date(aLatestTime);
    });
});

function formatApprovalDate(timestamp) {
  if (!timestamp || !timestamp.seconds) {
    return "Invalid timestamp";
  }
  const date = new Date(timestamp.seconds * 1000);
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return `${month} ${day}, ${year}, ${time}`;
}

function getLatestApprovalDate(post) {
  if (!post.history || post.history.length === 0) {
    return "No approval date available";
  }

  const latestTime = post.history.reduce((latest, entry) => {
    return entry.time > latest ? entry.time : latest;
  }, post.history[0].time);

  return latestTime;
}

watch(approvedPosts, (newPosts, oldPosts) => {
  console.log("New approved posts:", newPosts);
});

onMounted(async () => {
  console.log(userId.value);
  console.log(alumniId.value);
  const coursesSnapshot = await getDocs(collection(db, "classYears"));
  schoolYears.value = coursesSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));

  const classYearsSnapshot = await getDocs(collection(db, "events"));
  events.value = classYearsSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));

  onSnapshot(collection(db, "posts"), (snapshot) => {
    posts.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    approvedPosts.value = posts.value.filter(
      (post) => post.status === "approved"
    );
  });
});
</script>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  z-index: 2;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

/* Modal content */
.main-content {
  width: calc(100% - 400px);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 400px;
  height: auto;
  position: relative;
}

.modal-header {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 60px;
}

.modal-main-content-container {
  height: calc(100% - 60px);
  margin-top: 60px;
}

/* Close button */
.close {
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.image-preview img {
  max-width: 300px;
  max-height: 200px;
  margin-top: 10px;
}
.posts-container {
  height: auto;
  width: 100% !important;
  overflow-y: auto;
}
.btn-post {
  background-color: #400;
  color: #fff;
  padding: 10px 15px 10px 15px;
  border-radius: 15px;
}
.btn-post:hover {
  background-color: #330303;
  color: #fff;
  padding: 10px 15px 10px 15px;
  border-radius: 15px;
}
</style>
