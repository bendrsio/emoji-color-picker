"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Copy, Check, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import GitHubButton from "react-github-btn";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type EmojiData = {
  emoji: string;
  name: string;
  unicode: string;
  hex: string;
  rgb: [number, number, number];
  area: number;
};

export const ColorPicker = () => {
  const [color, setColor] = useState("#7C4DFF");
  const [isValidColor, setIsValidColor] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emojiCopied, setEmojiCopied] = useState(false);
  const [matchingEmoji, setMatchingEmoji] = useState<EmojiData | null>(null);
  const [emojiColorData, setEmojiColorData] = useState<EmojiData[]>([]);
  const [loadingEmojis, setLoadingEmojis] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    fetch("/emoji_list.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load emoji data");
        }
        return response.json();
      })
      .then((data) => {
        setEmojiColorData(data);
        setLoadingEmojis(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingEmojis(false);
      });
  }, []);

  useEffect(() => {
    const valid = isValidHexColor(color);
    setIsValidColor(valid);

    if (valid && emojiColorData.length > 0) {
      setMatchingEmoji(findClosestEmoji(color));
    }
  }, [color, emojiColorData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEmojiToClipboard = () => {
    if (matchingEmoji) {
      navigator.clipboard.writeText(matchingEmoji.emoji);
      setEmojiCopied(true);
      setTimeout(() => setEmojiCopied(false), 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^#([A-Fa-f0-9]{0,6})$/.test(value)) {
      setColor(value);
    } else if (value.startsWith("#")) {
      setColor(value);
    } else if (/^([A-Fa-f0-9]{0,6})$/.test(value)) {
      setColor(`#${value}`);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const colorDistance = (color1: string, color2: string) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  const findClosestEmoji = (color: string) => {
    if (emojiColorData.length === 0) return null;

    let closestEmoji = emojiColorData[0];
    let minDistance = Number.MAX_VALUE;

    emojiColorData.forEach((emojiData) => {
      const distance = colorDistance(color, emojiData.hex);
      if (distance < minDistance) {
        minDistance = distance;
        closestEmoji = emojiData;
      }
    });

    return closestEmoji;
  };

  const findEmojiByCharacter = (character: string) => {
    return emojiColorData.find((item) => item.emoji === character) || null;
  };

  const isValidHexColor = (color: string) => {
    return /^#([A-Fa-f0-9]{6})$/.test(color);
  };

  const rgb = hexToRgb(color);

  if (loadingEmojis) return <p>Loading emojis...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Card className="w-full max-w-4xl shadow-lg relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <CardHeader className="">
        {/* <CardTitle>Color Picker</CardTitle> */}
        <CardDescription>
          Select a color to find a matching emoji
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Left Side - takes 3 columns */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <HexColorPicker
              color={isValidColor ? color : "#000000"}
              onChange={setColor}
              className="w-full flex justify-center"
            />
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="flex mt-1 items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-2 border flex-shrink-0"
                      style={{
                        backgroundColor: color,
                      }}
                    ></div>
                    <Input
                      id="hex-color"
                      value={color}
                      onChange={handleInputChange}
                      className={`rounded-r-none h-8 text-sm ${
                        !isValidColor ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-l-none border-l-0 h-8 w-8"
                      onClick={copyToClipboard}
                      disabled={!isValidColor}
                    >
                      {copied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - takes 3 columns */}
          <div className="md:col-span-3 flex flex-col justify-between space-y-3">
            {isValidColor && matchingEmoji ? (
              <div className="relative flex flex-col items-center justify-center bg-background/5 rounded-lg p-2 border h-30 sm:h-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-7 px-2"
                  onClick={copyEmojiToClipboard}
                >
                  {emojiCopied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <div className="text-[75px] sm:text-[100px] leading-none mb-2">
                  {matchingEmoji.emoji}
                </div>
                <h4 className="font-medium text-center truncate text-sm">
                  {(() => {
                    const sanitizedName = matchingEmoji.name
                      .replace(
                        /_(?:dark|medium|light|medium-dark|medium-light)_skin_tone/gi,
                        ""
                      )
                      .replace(/facing_(?:right|left)/g, " ")
                      .replace(/_/g, " ");
                    return sanitizedName;
                  })()}
                </h4>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px] bg-background/5 rounded-lg border">
                <div className="text-muted-foreground text-sm italic text-center px-4">
                  {isValidColor
                    ? "Select a color to see matching emoji"
                    : "Enter a valid hex color"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Credit footer */}
        <div className="border-t border-border items-center flex justify-between items-center pt-2">
          {/* <a
            href="https://x.com/bendrsio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:text-foreground transition-colors underline"
          >
            Follow @bendrsio on X
          </a> */}
          <a
            href="https://twitter.com/bendrsio?ref_src=twsrc%5Etfw"
            className="twitter-follow-button"
            data-show-count="true"
          >
            Follow @bendrsio
          </a>
          <script async src="https://platform.twitter.com/widgets.js"></script>
          <GitHubButton
            href="https://github.com/bendrsio/emoji-color-picker"
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            data-icon="octicon-star"
            data-size="large"
            data-show-count="true"
            aria-label="Star bendrsio/emoji-color-picker on GitHub"
          >
            Star
          </GitHubButton>
        </div>
        <div className="flex justify-center">
          <a
            href="https://github.com/bendrsio/emoji-color-data"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Get My Emoji Data Here (Emojis RGB Color Averages)
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
