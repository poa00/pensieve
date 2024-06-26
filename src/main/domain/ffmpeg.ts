import { execa } from "execa";
import path from "path";
import {
  getExtraResourcesFolder,
  getMillisecondsFromTimeString,
} from "../../main-utils";
import * as runner from "./runner";
import * as settings from "./settings";

const ffmpegPath = path.join(getExtraResourcesFolder(), "ffmpeg.exe");

export const simpleTranscode = async (input: string, output: string) => {
  await execa(ffmpegPath, ["-i", input, "-y", output], {
    stdio: "inherit",
  });
};

export const toWavFile = async (input: string, output: string) => {
  await execa(
    ffmpegPath,
    ["-i", input, "-ac", "2", "-y", "-ar", "16000", output],
    {
      stdio: "inherit",
    },
  );
};

export const toStereoWavFile = async (
  input1: string,
  input2: string,
  output: string,
) => {
  // https://trac.ffmpeg.org/wiki/AudioChannelManipulation#a2monostereo
  await runner.execute(
    ffmpegPath,
    [
      // "-i",      input1,      "-i",      input2,      "-filter_complex",      "[0:a][1:a]join=inputs=2:channel_layout=stereo[a]",      "-map",      "[a]",      "-y",      "-ar",      "16000",      output,

      "-i",
      input1,
      "-i",
      input2,
      "-filter_complex",
      (await settings.getSettings()).ffmpeg.stereoWavFilter, // afftdn=nf=-20
      "-map",
      "[a]",
      "-ar",
      "16000",
      "-y",
      output,
    ],
    { stdio: "inherit" },
  );
};

export const toJoinedFile = async (
  input1: string | null,
  input2: string | null,
  output: string,
) => {
  if (!input1 && !input2) {
    throw new Error("No input files");
  }

  if (input1 && input2) {
    await runner.execute(
      ffmpegPath,
      [
        "-i",
        input1,
        "-i",
        input2,
        "-filter_complex",
        (await settings.getSettings()).ffmpeg.mp3Filter,
        "-y",
        output,
      ],
      { stdio: "inherit" },
    );
  } else {
    await execa(ffmpegPath, ["-i", (input1 ?? input2)!, "-y", output], {
      stdio: "inherit",
    });
  }
};

export const getDuration = async (input: string) => {
  const { stdout, stderr } = await runner.execute(
    ffmpegPath,
    ["-i", input, "-f", "null", "-"],
    {
      stdout: "pipe",
    },
  );
  const match = (stderr || stdout).match(
    /duration\s*:?\s(\d{2}:\d{2}:\d{2}.\d{2})/i,
  );
  const time = match?.[1];
  if (!time) return 0;
  return getMillisecondsFromTimeString(time!);
};
