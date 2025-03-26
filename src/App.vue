<script setup lang="ts">
import { Vector2, Vector3 } from 'three';
import { computed, ref } from 'vue';
import { VNumberInput } from 'vuetify/labs/VNumberInput';
import { BRICK_PATTERNS, BRICK_SIZES, getBrickWall, getBrickWallFromTo, getBrickWallWithWindow, STANDARD_MORTAR_WIDTH } from './bricks';
import BrickWallRenderer from './BrickWallRenderer.vue';

const currentPatternName = ref('märkischerVerbandKlassisch' as keyof typeof BRICK_PATTERNS);
const currentPattern = computed(() => BRICK_PATTERNS[currentPatternName.value]);

const wallHeight = ref(120);
const wallWidth = ref(200);
const wallSize = computed(() => new Vector2(wallWidth.value, wallHeight.value));

const windowHeight = ref(60);
const windowWidth = ref(40);
const windowSize = computed(() => new Vector2(windowWidth.value, windowHeight.value));

const windowX = ref(80);
const windowY = ref(25);
const windowPos = computed(() => new Vector2(windowX.value, windowY.value));

const bricks = computed(() => getBrickWallWithWindow(wallSize.value, windowPos.value, windowSize.value, currentPattern.value));
</script>

<template>
    <v-container fluid>
        <v-card>
            <v-card-title>
                <v-row style="margin-top: 20px">
                    <v-col cols="4">
                        <v-select hide-details="auto" label="Verband" :items="Object.keys(BRICK_PATTERNS)" v-model="currentPatternName"></v-select>
                    </v-col>
                    <v-col cols="4">
                        <v-slider label="Wand Höhe" min="0" max="200" thumb-label="always" v-model="wallHeight"></v-slider>
                    </v-col>
                    <v-col cols="4">
                        <v-slider label="Wand Breite" min="0" max="300" thumb-label="always" v-model="wallWidth"></v-slider>
                    </v-col>
                    <v-col cols="3">
                        <v-slider label="Fenster Höhe" min="0" max="100" thumb-label="always" v-model="windowHeight"></v-slider>
                    </v-col>
                    <v-col cols="3">
                        <v-slider label="Fenster Breite" min="0" max="100" thumb-label="always" v-model="windowWidth"></v-slider>
                    </v-col>
                    <v-col cols="3">
                        <v-slider label="Fenster Position X" min="0" max="200" thumb-label="always" v-model="windowX"></v-slider>
                    </v-col>
                    <v-col cols="3">
                        <v-slider label="Fenster Position Y" min="0" max="100" thumb-label="always" v-model="windowY"></v-slider>
                    </v-col>
                </v-row>
            </v-card-title>

            <div style="height: 600px">
                <BrickWallRenderer :bricks="bricks" :wallSize="wallSize" />
            </div>
        </v-card>
    </v-container>
</template>
