<template>
    <div v-if="currentAlbumPage === 'Main'">
        <MainPage :currentAlbumPage="currentAlbumPage" @update:currentPage="currentAlbumPage = $event" @folder-name="updateSelectedFolder"/>
    </div>
    <div v-if="currentAlbumPage === 'PAB'">
        <PAB :folderName="selectedFolderName"  @update:currentPage="currentAlbumPage = $event" @subfolder-name="updateSelectedSubFolder"/>
    </div>
    <div v-if="currentAlbumPage === 'Chosen PAB'">
        <ChosenPAB :folderName="selectedFolderName" :subfolderName="selectedSubFolderName" @update:currentPage="currentAlbumPage = $event" @grad-subfolder-name="updateSelectedGradSubFolder"/>
    </div>
    <div v-if="currentAlbumPage === 'Graduation Portrait'">
        <GraduationPortrait :folderName="selectedFolderName" :subfolderName="selectedSubFolderName" :gradsubfolderName="selectedGradSubFolderName" @update:currentPage="currentAlbumPage = $event" />
    </div>
    <div v-if="currentAlbumPage === 'Gallery'">
        <Gallery :folderName="selectedFolderName" :subfolderName="selectedSubFolderName" :gradsubfolderName="selectedGradSubFolderName" @update:currentPage="currentAlbumPage = $event" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import MainPage from './graduation-album-components/graduation-album-main.vue'
import PAB from './graduation-album-components/graduation-album-pab.vue'
import ChosenPAB from './graduation-album-components/graduation-album-chosen-pab.vue'
import GraduationPortrait from './graduation-album-components/graduation-album-graduation-portrait.vue'
import Gallery from './graduation-album-components/graduation-album-gallery.vue'

const currentAlbumPage = ref('Main')
const selectedFolderName = ref('');
const selectedSubFolderName = ref('');
const selectedGradSubFolderName = ref('');

const updateSelectedFolder = (folderName) => {
  console.log('Folder name selected:', folderName);
  selectedFolderName.value = folderName;
  currentAlbumPage.value = 'PAB';
};

const updateSelectedSubFolder = (subfolderName) => {
  console.log('Folder name selected:', subfolderName);
  selectedSubFolderName.value = subfolderName;
  currentAlbumPage.value = 'Chosen PAB';
};

const updateSelectedGradSubFolder = (gradsubfolderName) => {
  console.log('Folder name selected:', gradsubfolderName);
  if (gradsubfolderName === 'Graduation Portrait') {
    selectedGradSubFolderName.value = gradsubfolderName;
    currentAlbumPage.value = 'Graduation Portrait';
  }else {
    selectedGradSubFolderName.value = gradsubfolderName;
    currentAlbumPage.value = 'Gallery';
  }
};
</script>