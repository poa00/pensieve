import { Buffer } from "buffer";
import { useCallback, useEffect, useRef } from "react";

export const blobToBuffer = async (blob: Blob) => {
  return new Promise<Buffer>((r) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState !== 2) {
        return;
      }
      r(Buffer.from(reader.result as ArrayBuffer));
    };
    reader.readAsArrayBuffer(blob);
  });
};

export const timeToDisplayString = (time: number, withMs = true) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 10);

  const hoursString = hours > 0 ? `${hours}:` : "";
  const msString = withMs ? `.${String(ms).padStart(1, "0")}` : "";
  return `${hoursString}${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}${msString}`;
};

export const isNotNull = <T>(x: T | null): x is T => x !== null;

export const isInRange = (value: number, range: readonly [number, number]) =>
  value >= range[0] && value < range[1];

export const useEvent = <T extends (...p: any[]) => any>(handler: T) => {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  return useCallback(
    (...args: Parameters<T>) => handlerRef.current(...args),
    [],
  );
};
