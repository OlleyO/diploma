<style scoped></style>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Home Page</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding my-custom-camera-preview-content">
      <canvas ref="canvasRef"
      style="position: absolute; margin-left: auto; margin-right: auto; left: 0; right: 0; text-align: center; z-index: 8; width: 640; height: 480;" />
      <ion-button expand="block" @click="startCamera">Run Camera</ion-button>
      <ion-button expand="block" @click="stopCamera">Stop Camera</ion-button>
      <ion-button expand="block" @click="flipCamera">Run Camera</ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage } from '@ionic/vue';
import * as tf from "@tensorflow/tfjs";
import { nextFrame } from "@tensorflow/tfjs";
import { drawRect } from "./utilities";

import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { CameraSampleOptions } from '@capacitor-community/camera-preview';
import { onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null)

const cameraPreviewOptions: CameraPreviewOptions = {
  position: 'front',
  height: 500,
  width: 320
}


const cameraSampleOptions: CameraSampleOptions = {
  quality: 85
};





function startCamera() {
  CameraPreview.start(cameraPreviewOptions);
}

function stopCamera() {
  CameraPreview.stop();
}

function flipCamera() {
  CameraPreview.flip()
}

async function runCoco() {
  const net = await tf.loadGraphModel('https://tensorflowjsrealtimemodel.s3.au-syd.cloud-object-storage.appdomain.cloud/model.json')

  //  Loop and detect hands
  setInterval(() => {
    detect(net);
  }, 16.7);
}

// function base64ToArrayBuffer(base64) {
//     var binaryString = atob(base64);
//     var bytes = new Uint8Array(binaryString.length);
//     for (var i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//     }
//     return bytes.buffer;
// }

function base64ToImage(base64img: string) {
  const img = new Image();
  img.src = base64img;

  return img
}

async function detect(net) {
  const result = await CameraPreview.captureSample(cameraSampleOptions);
  const base64PictureData = result.value;
  const img = tf.browser.fromPixels(base64ToImage(base64PictureData))

  const resized = tf.image.resizeBilinear(img, [640, 480])
  const casted = resized.cast('int32')
  const expanded = casted.expandDims(0)
  const obj = await net.executeAsync(expanded)

  console.log(obj)

  const boxes = await obj[1].array()
  const classes = await obj[2].array()
  const scores = await obj[4].array()

  console.log(boxes, classes, scores)

  const ctx = canvasRef.value!.getContext('2d')

  requestAnimationFrame(() => {
    drawRect(boxes[0], classes[0], scores[0], 0.8, cameraPreviewOptions.width, cameraPreviewOptions.height, ctx)
  })

  tf.dispose(img)
  tf.dispose(resized)
  tf.dispose(casted)
  tf.dispose(expanded)
  tf.dispose(obj)

  onMounted(() => {
    runCoco()
  })
}
</script>

<style scoped>
.my-custom-camera-preview-content {
  --background: transparent;
}
</style>