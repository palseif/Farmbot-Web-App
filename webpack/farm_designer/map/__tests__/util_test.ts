import {
  round,
  translateScreenToGarden,
  getBotSize,
  getMapSize,
  transformXY,
  transformForQuadrant
} from "../util";
import { McuParams } from "farmbot";
import { AxisNumberProperty, BotSize, MapTransformProps } from "../interfaces";
import { StepsPerMmXY } from "../../../devices/interfaces";

describe("Utils", () => {
  it("rounds a number", () => {
    expect(round(44)).toEqual(40);
    expect(round(98)).toEqual(100);
  });
});

describe("translateScreenToGarden()", () => {
  it("translates garden coords to screen coords: corner case", () => {
    const cornerCase = translateScreenToGarden({
      mapTransformProps: { quadrant: 2, gridSize: { x: 3000, y: 1500 } },
      page: { x: 520, y: 212 },
      scroll: { left: 0, top: 0 },
      zoomLvl: 1,
      gridOffset: { x: 0, y: 0 },
    });
    expect(cornerCase.x).toEqual(200);
    expect(cornerCase.y).toEqual(100);
  });

  it("translates garden coords to screen coords: edge case", () => {
    const edgeCase = translateScreenToGarden({
      mapTransformProps: { quadrant: 2, gridSize: { x: 3000, y: 1500 } },
      page: { x: 1132, y: 382 },
      scroll: { left: 0, top: 0 },
      zoomLvl: 0.3,
      gridOffset: { x: 0, y: 0 },
    });

    expect(Math.round(edgeCase.x)).toEqual(2710);
    expect(Math.round(edgeCase.y)).toEqual(910);
  });
});

describe("getbotSize()", () => {
  function fakeProps() {
    const botMcuParams: McuParams = {
      movement_stop_at_max_x: undefined,
      movement_stop_at_max_y: undefined,
      movement_axis_nr_steps_x: undefined,
      movement_axis_nr_steps_y: undefined
    };
    const stepsPerMmXY: StepsPerMmXY = { x: undefined, y: undefined };
    const defaultLength: AxisNumberProperty = { x: 3000, y: 1500 };
    return {
      botMcuParams,
      stepsPerMmXY,
      defaultLength
    };
  }

  function expectDefaultSize(botSize: BotSize) {
    expect(botSize).toEqual({
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true }
    });
  }

  it("returns default bed size: when settings undefined", () => {
    const p = fakeProps();
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when stop at max disabled", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 0,
      movement_stop_at_max_y: 0,
      movement_axis_nr_steps_x: 100,
      movement_axis_nr_steps_y: 100
    };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when axis length is default", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 0,
      movement_axis_nr_steps_y: 0
    };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when steps per mm is 0", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 100,
      movement_axis_nr_steps_y: 100
    };
    p.stepsPerMmXY = { x: 0, y: 0 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("calculates correct bed size: both axes", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 500,
      movement_axis_nr_steps_y: 1400
    };
    p.stepsPerMmXY = { x: 5, y: 7 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expect(botSize).toEqual({
      x: { value: 100, isDefault: false },
      y: { value: 200, isDefault: false }
    });
  });

  it("calculates correct bed size: one axis", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 0,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 500,
      movement_axis_nr_steps_y: 1400
    };
    p.stepsPerMmXY = { x: 5, y: 7 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expect(botSize).toEqual({
      x: { value: 3000, isDefault: true },
      y: { value: 200, isDefault: false }
    });
  });
});

describe("getMapSize()", () => {
  it("calculates map size", () => {
    const mapSize = getMapSize(
      { x: 2000, y: 1000 },
      { x: 100, y: 50 });
    expect(mapSize).toEqual({ x: 2200, y: 1100 });
  });
});

describe("transformXY", () => {
  const gridSize = { x: 2000, y: 1000 };

  type QXY = { qx: number, qy: number };

  const transformCheck =
    (original: QXY, transformed: QXY, transformProps: MapTransformProps) => {
      expect(transformXY(original.qx, original.qy, transformProps))
        .toEqual(transformed);
      expect(transformXY(transformed.qx, transformed.qy, transformProps))
        .toEqual(original);
    };

  it("calculates transformed coordinate: quadrant 2", () => {
    const original = { qx: 100, qy: 200 };
    const transformed = { qx: 100, qy: 200 };
    const transformProps = { quadrant: 2, gridSize };
    transformCheck(original, transformed, transformProps);
  });

  it("calculates transformed coordinate: quadrant 4", () => {
    const original = { qx: 100, qy: 200 };
    const transformed = { qx: 1900, qy: 800 };
    const transformProps = { quadrant: 4, gridSize };
    transformCheck(original, transformed, transformProps);
  });

  it("calculates transformed coordinate: quadrant 4 (outside of grid)", () => {
    const original = { qx: 2200, qy: 1100 };
    const transformed = { qx: -200, qy: -100 };
    const transformProps = { quadrant: 4, gridSize };
    transformCheck(original, transformed, transformProps);
  });
});

describe("transformForQuadrant()", () => {
  it("calculates transform for quadrant 1", () => {
    expect(transformForQuadrant({ quadrant: 1, gridSize: { x: 200, y: 100 } }))
      .toEqual("scale(-1, 1) translate(-200, 0)");
  });

  it("calculates transform for quadrant 2", () => {
    expect(transformForQuadrant({ quadrant: 2, gridSize: { x: 200, y: 100 } }))
      .toEqual("scale(1, 1) translate(0, 0)");
  });

  it("calculates transform for quadrant 3", () => {
    expect(transformForQuadrant({ quadrant: 3, gridSize: { x: 200, y: 100 } }))
      .toEqual("scale(1, -1) translate(0, -100)");
  });

  it("calculates transform for quadrant 4", () => {
    expect(transformForQuadrant({ quadrant: 4, gridSize: { x: 200, y: 100 } }))
      .toEqual("scale(-1, -1) translate(-200, -100)");
  });
});
