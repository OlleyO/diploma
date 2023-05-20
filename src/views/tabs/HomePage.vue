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
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button>
          <ion-icon :icon="chevronUpCircle"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button @click="startCamera">
            <ion-icon :icon="videocamOutline"></ion-icon>
          </ion-fab-button>
          <ion-fab-button @click="flipCamera">
            <ion-icon :icon="cameraReverseOutline"></ion-icon>
          </ion-fab-button>
          <ion-fab-button @click="stopCamera">
            <ion-icon :icon="videocamOffOutline"></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { videocamOutline, chevronUpCircle, videocamOffOutline, cameraReverseOutline } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import * as tf from "@tensorflow/tfjs";
// import { nextFrame } from "@tensorflow/tfjs";
import { drawRect } from "../../utils/index";

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

async function detect(net: tf.GraphModel<string | tf.io.IOHandler>) {
  const result = await CameraPreview.captureSample(cameraSampleOptions);
  const base64PictureData = result.value;
  const img = tf.browser.fromPixels(base64ToImage(base64PictureData))

  const resized = tf.image.resizeBilinear(img, [640, 480])
  const casted = resized.cast('int32')
  const expanded = casted.expandDims(0)
  const obj = await net.executeAsync(expanded)

  console.log(obj)

  const boxes = await (obj as any)[1].array()
  const classes = await (obj as any).array()
  const scores = await (obj as any)[4].array()

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