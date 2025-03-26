<script setup lang="ts">
import { Box, Edges, MeshGlassMaterial, OrbitControls, Line2 } from '@tresjs/cientos';
import { TresCanvas } from '@tresjs/core';
import { SRGBColorSpace, Vector2, Vector3 } from 'three';

const to3d = (v: Vector2) => new Vector3(v.x, v.y, 0);

defineProps<{
    bricks: {
        type: 'brick' | 'mortar';
        size: Vector3;
        position: Vector3;
    }[];
    wallSize: Vector2;
}>();
</script>

<template>
    <TresCanvas :clearColor="'white'" :outputColorSpace="SRGBColorSpace">
        <TresOrthographicCamera :position="[0, 0, 200]" :look-at="[0, 0, 0]" :zoom="4" />
        <OrbitControls />
        <TresAmbientLight :intensity="0.5" :color="'white'" />

        <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" cast-shadow />
        <TresGroup :position="to3d(wallSize.clone().multiplyScalar(-0.5))">
            <!-- <Line2
                v-for="rectangle of [[new Vector2(0, 0), wallSize]]"
                :points="[
                    to3d(rectangle[0]),
                    to3d(new Vector2(rectangle[1].x, rectangle[0].y)),
                    to3d(rectangle[1]),
                    to3d(new Vector2(rectangle[0].x, rectangle[1].y)),
                    to3d(rectangle[0]),
                ]"
                :line-width="4"
                color="black"
            /> -->
            <template v-for="brick of bricks" :key="JSON.stringify(brick)">
                <Box :args="brick.size.toArray()" :position="brick.position.clone().sub(brick.size.clone().setZ(0).multiplyScalar(-0.5)).toArray()">
                    <MeshGlassMaterial />
                    <TresMeshToonMaterial :color="brick.type === 'brick' ? '#963E1F' : '#AAAAAA'" />
                    <Edges color="black" />
                </Box>
            </template>
        </TresGroup>
    </TresCanvas>
</template>
