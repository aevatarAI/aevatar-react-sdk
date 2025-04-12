import "@testing-library/jest-dom/vitest";
import '@testing-library/jest-dom';

import React from "react";
import { TextDecoder } from "node:util";
import type { ApolloQueryResult } from "@apollo/client/core/types";
import { configure as domConf } from "@testing-library/dom";
import {
  cleanup,
  configure as reactConf,
  renderHook,
} from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

// JSDom + Vitest don't play well with each other. Long story short - default
// TextEncoder produces Uint8Array objects that are _different_ from the global
// Uint8Array objects, so some functions that compare their types explode.
// https://github.com/vitest-dev/vitest/issues/4043#issuecomment-1905172846
class ESBuildAndJSDOMCompatibleTextEncoder extends TextEncoder {
  encode(input: string) {
    if (typeof input !== "string") {
      throw new TypeError("`input` must be a string");
    }

    const decodedURI = decodeURIComponent(encodeURIComponent(input));
    const arr = new Uint8Array(decodedURI.length);
    const chars = decodedURI.split("");
    for (let i = 0; i < chars.length; i++) {
      arr[i] = decodedURI[i].charCodeAt(0);
    }
    return arr;
  }
}

global.TextEncoder = ESBuildAndJSDOMCompatibleTextEncoder;
// @ts-expect-error TextDecoder
global.TextDecoder = TextDecoder;
global.React = React; // this also works for other globally available libraries

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      // do nothing
    }
    unobserve() {
      // do nothing
    }
    disconnect() {
      // do nothing
    }
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
afterAll(() => {
  vi.restoreAllMocks();
});

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
// https://github.com/wobsoriano/vitest-canvas-mock/issues/16
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn().mockReturnValue({ data: [] }),
    putImageData: vi.fn(),
    createImageData: vi.fn().mockReturnValue([]),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 0 }),
  });
}

const TESTING_LIBRARY_CONF = {
  // prevents large unhelpful HTML DOM outputs on failed tests
  getElementError: (message: string | null) => {
    const error = new Error(message ?? undefined);
    error.name = "TestingLibraryElementError";
    error.stack = undefined;
    return error;
  },
};

/**
 * Need to configure both '@testing-library/dom' and '@testing-library/react' libraries
 * since there are 2 instances of '@testing-library/dom'. 1 instance is coming from
 * '@testing-library/user-event' and another from '@testing-library/react'.
 * More info: https://github.com/testing-library/react-testing-library/issues/1103
 */
domConf(TESTING_LIBRARY_CONF);
reactConf(TESTING_LIBRARY_CONF);

vi.mock("lottie-web");
vi.mock("node-fetch");

vi.mock("aelf-sdk", async (importOriginal) => {
  const actual: any = await importOriginal();

  return {
    ...actual,
    default: {
      ...actual.default,
      providers: vi.fn().mockImplementation(() => {
        return {
          HttpProvider: vi.fn().mockImplementation(() => ({})),
        };
      }),
      utils: {
        decodeAddressRep: vi.fn(),
      },
      wallet: {
        createNewWallet: vi.fn(),
      },
    },
  };
});

vi.mock("jotai", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useAtom: vi.fn(),
  };
});
