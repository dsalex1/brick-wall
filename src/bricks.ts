import { Vector2, Vector3 } from 'three';

export const STANDARD_MORTAR_WIDTH = 1;

export const BRICK_SIZES = {
    whole: new Vector3(24.0, 7.1, 11.5),
    half: new Vector3(11.5, 7.1, 11.5),
    quarter: new Vector3(5.25, 7.1, 11.5),
    threeQuarters: new Vector3(17.5, 7.1, 11.5),
};

const END_BRICKS_SORTED = ['quarter', 'half', 'threeQuarters', 'whole'] as const;

type BrickType = keyof typeof BRICK_SIZES;

export const BRICK_PATTERNS = {
    halb_läuferverband: (x, y) =>
        ((
            {
                1: x == 0 ? 'half' : 'whole',
                0: 'whole',
            } as const
        )[y % 2]!),
    viertel_läuferverband: (x, y) =>
        ((
            {
                3: x == 0 ? 'threeQuarters' : 'whole',
                2: x == 0 ? 'half' : 'whole',
                1: x == 0 ? 'quarter' : 'whole',
                0: 'whole',
            } as const
        )[y % 4]!),
    blockverband: (x, y) =>
        ((
            {
                1: x == 0 ? 'threeQuarters' : 'whole',
                0: 'half',
            } as const
        )[y % 2]!),
    kreuzverband: (x, y) =>
        ((
            {
                3: x == 0 ? 'threeQuarters' : x == 1 ? 'half' : 'whole',
                2: 'half',
                1: x == 0 ? 'threeQuarters' : 'whole',
                0: 'half',
            } as const
        )[y % 4]!),
    kopfverband: (x, y) =>
        ((
            {
                1: x == 0 ? 'threeQuarters' : 'half',
                0: 'half',
            } as const
        )[y % 2]!),
    wilderverband: (x, y) =>
        ((
            {
                1: x == 0 ? 'threeQuarters' : Math.random() > 0.5 ? 'half' : 'whole',
                0: Math.random() > 0.75 ? 'half' : 'whole',
            } as const
        )[y % 2]!),
    märkischerVerbandKlassisch: (x, y) =>
        ((
            {
                1: x % 3 <= 1 ? 'whole' : 'half',
                0: x === 0 ? 'threeQuarters' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
            } as const
        )[y % 2]!),
    märkischerVerbandZickzack: (x, y) =>
        ((
            {
                5: x === 0 ? 'half' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
                4: x === 0 ? 'threeQuarters' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
                3: x === 0 ? 'whole' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
                2: x === 0 ? 'threeQuarters' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
                1: x === 0 ? 'half' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
                0: x === 0 ? 'quarter' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
            } as const
        )[y % 6]!),
    gotischerVerband: (x, y) =>
        ((
            {
                1: x % 2 == 0 ? 'half' : 'whole',
                0: x === 0 ? 'threeQuarters' : x % 2 == 0 ? 'half' : 'whole',
            } as const
        )[y % 2]!),
    holländischerVerband: (x, y) =>
        ((
            {
                1: x === 0 ? 'threeQuarters' : x % 2 == 0 ? 'whole' : 'half',
                0: 'half',
            } as const
        )[y % 2]!),
    schlesischerVerband: (x, y) =>
        ((
            {
                1: x === 0 ? 'threeQuarters' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
                0: x === 0 ? 'half' : (x + 1) % 3 <= 1 ? 'whole' : 'half',
            } as const
        )[y % 2]!),
    flämischerVerband: (x, y) =>
        ((
            {
                1: x % 2 == 0 ? 'half' : 'whole',
                0: x === 0 ? 'threeQuarters' : x % 2 == 0 ? 'whole' : 'half',
            } as const
        )[y % 2]!),
} satisfies Record<string, (x: number, y: number) => BrickType>;

/**
 * Generates a concrete pattern of bricks for a wall of a given width.
 * The pattern is determined by a provided function that specifies the type of brick at each index.
 * The rest of the wall is filled with the largest bricks that fits.
 *
 * @param wallWidth - The total width of the wall.
 * @param pattern - A function that returns the type of brick for a given index.
 * @returns An array of brick types that fit within the specified wall width.
 *
 * @example
 * ```typescript
 * getConcretePattern(40, (x) => (x % 2 === 0 ? "whole" : "half")) // ['whole', 'half']
 * getConcretePattern(60, (x) => (x % 2 === 0 ? "whole" : "half")) // ['whole', 'half', 'threeQuarters']
 * ```
 */
function getConcretePattern(wallWidth: number, pattern: (index: number) => BrickType) {
    let currentX = 0;
    const brickPattern: BrickType[] = [];
    while (true) {
        const nextType = pattern(brickPattern.length);

        const widthOfNext2 = BRICK_SIZES[nextType].x + STANDARD_MORTAR_WIDTH + BRICK_SIZES[END_BRICKS_SORTED[0]].x;

        // if we can fit the next brick, and at least the shortest end brick, add the next one and continue
        if (currentX + widthOfNext2 <= wallWidth) {
            brickPattern.push(nextType);
            currentX += BRICK_SIZES[nextType].x + STANDARD_MORTAR_WIDTH;
            continue;
        } else {
            // if thats not the case, the next brick is the last one
            // so we need ot find the largest that fits
            const lastType = END_BRICKS_SORTED.toReversed().find((type) => currentX + BRICK_SIZES[type].x <= wallWidth);
            // add it if it fits
            if (lastType && currentX + BRICK_SIZES[lastType].x <= wallWidth) brickPattern.push(lastType);
            break;
        }
    }
    return brickPattern;
}

/**
 * Generates a row of bricks for a given wall size and y position.
 * The pattern of bricks is determined by a provided function that specifies the type of brick at each index.
 */
function getBrickRow(wallSize: Vector2, y: number, patternGenerator: (index: number) => BrickType) {
    const resultBricks: {
        type: 'brick' | 'mortar';
        size: Vector3;
        position: Vector3;
    }[] = [];

    const getBrick = (x: number, size: Vector3) => ({
        type: 'brick' as const,
        size,
        position: new Vector3(x, y, 0),
    });

    const getMortar = (x: number, width: number) => ({
        type: 'mortar' as const,
        size: new Vector3(width, BRICK_SIZES.half.y, BRICK_SIZES.half.z * 0.8),
        position: new Vector3(x, y, 0),
    });

    const pattern = getConcretePattern(wallSize.x, patternGenerator);

    const mortarWidth = (wallSize.x - pattern.map((brickType) => BRICK_SIZES[brickType].x).reduce((a, b) => a + b, 0)) / (pattern.length - 1);

    let currentX = 0;

    for (const brickType of pattern) {
        if (currentX !== 0) {
            resultBricks.push(getMortar(currentX, mortarWidth));
            currentX += mortarWidth;
        }
        resultBricks.push(getBrick(currentX, BRICK_SIZES[brickType]));
        currentX += BRICK_SIZES[brickType].x;
    }

    return resultBricks;
}

export const to3d = (v: Vector2) => new Vector3(v.x, v.y, 0);

/**
 * Generates a brick wall with a given size and pattern.
 * The pattern is determined by a provided function that specifies the type of brick at each position in the Wall.
 * @param wallSize - The size of the wall.
 * @param currentPattern - A function that returns the type of brick for a given index.
 * @param yOffset - An offset for the y position of the bricks.
 * @param startMortar - Whether the wall should start with a mortar layer.
 * @param endMortar - Whether the wall should end with a mortar layer.
 */
export function getBrickWall(
    wallSize: Vector2,
    currentPattern: (x: number, y: number) => BrickType,
    { yOffset = 0, startMortar = false, endMortar = false }: { yOffset?: number; startMortar?: boolean; endMortar?: boolean },
) {
    const arr: { type: 'brick' | 'mortar'; size: Vector3; position: Vector3 }[] = [];

    const extraMortarLayers = (startMortar ? 1 : 0) + (endMortar ? 1 : 0);

    const brickLayers = Math.floor((wallSize.y - extraMortarLayers * STANDARD_MORTAR_WIDTH) / (BRICK_SIZES.whole.y + STANDARD_MORTAR_WIDTH));

    const mortarHeight = (wallSize.y - BRICK_SIZES.whole.y * brickLayers) / (brickLayers - 1 + extraMortarLayers);

    let currentY = 0;

    if (startMortar) {
        arr.push({
            type: 'mortar',
            size: new Vector3(wallSize.x, mortarHeight, BRICK_SIZES.whole.z * 0.9),
            position: new Vector3(0, 0, 0),
        });
        currentY += mortarHeight;
    }

    for (let y = 0; y < brickLayers; y++) {
        arr.push(...getBrickRow(wallSize, currentY, (x) => currentPattern(x, y + yOffset)));
        currentY += BRICK_SIZES.whole.y;

        if (y !== brickLayers - 1 || endMortar) {
            arr.push({
                type: 'mortar',
                size: new Vector3(wallSize.x, mortarHeight, BRICK_SIZES.whole.z * 0.9),
                position: new Vector3(0, currentY, 0),
            });
            currentY += mortarHeight;
        }
    }
    return { layers: brickLayers, bricks: arr };
}

/**
 * Generates a brick wall with from a start coordinate to an end coordinate.
 * The pattern is determined by a provided function that specifies the type of brick at each position in the Wall.
 * @param from - The start coordinate of the wall.
 * @param to - The end coordinate of the wall.
 * @param currentPattern - A function that returns the type of brick for a given index.
 * @param yOffset - An offset for the y position of the bricks.
 * @param startMortar - Whether the wall should start with a mortar layer.
 * @param endMortar - Whether the wall should end with a mortar layer.
 */
export function getBrickWallFromTo(
    from: Vector2,
    to: Vector2,
    currentPattern: (x: number, y: number) => BrickType,
    options: { yOffset?: number; startMortar?: boolean; endMortar?: boolean } = {},
) {
    const bricks = getBrickWall(to.clone().sub(from), currentPattern, options);

    return {
        layers: bricks.layers,
        bricks: bricks.bricks.map((b) => ({
            ...b,
            position: b.position.clone().add(to3d(from)),
        })),
    };
}

/**
 * Generates a brick wall with a window at a given position and size.
 * The pattern is determined by a provided function that specifies the type of brick at each position in the Wall.
 * @param wallSize - The size of the wall.
 * @param windowPos - The position of the window.
 * @param windowSize - The size of the window.
 * @param currentPattern - A function that returns the type of brick for a given index.
 */
export function getBrickWallWithWindow(
    wallSize: Vector2,
    windowPos: Vector2,
    windowSize: Vector2,
    currentPattern: (x: number, y: number) => BrickType,
) {
    const returnArr: {
        type: 'brick' | 'mortar';
        size: Vector3;
        position: Vector3;
    }[] = [];

    const bottomBricks = getBrickWallFromTo(new Vector2(0, 0), new Vector2(wallSize.x, windowPos.y), currentPattern);
    returnArr.push(...bottomBricks.bricks);

    const leftBricks = getBrickWallFromTo(new Vector2(0, windowPos.y), new Vector2(windowPos.x, windowPos.y + windowSize.y), currentPattern, {
        yOffset: bottomBricks.layers,
        startMortar: true,
        endMortar: true,
    });
    returnArr.push(...leftBricks.bricks);

    const rightBricks = getBrickWallFromTo(
        new Vector2(windowPos.x + windowSize.x, windowPos.y),
        new Vector2(wallSize.x, windowPos.y + windowSize.y),
        currentPattern,
        {
            yOffset: bottomBricks.layers,
            startMortar: true,
            endMortar: true,
        },
    );
    returnArr.push(...rightBricks.bricks);

    const topBricks = getBrickWallFromTo(new Vector2(0, windowPos.y + windowSize.y), new Vector2(wallSize.x, wallSize.y), currentPattern, {
        yOffset: bottomBricks.layers + leftBricks.layers,
    });
    returnArr.push(...topBricks.bricks);

    return returnArr;
}
