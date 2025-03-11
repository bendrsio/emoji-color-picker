"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type EmojiData = {
  emoji: string;
  name: string;
  unicode: string;
  hex: string;
  rgb: [number, number, number];
  area: number;
};

// Removed hardcoded emoji color data
export const ColorPicker = () => {
  const [color, setColor] = useState("#7C4DFF");
  const [isValidColor, setIsValidColor] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emojiCopied, setEmojiCopied] = useState(false);
  const [matchingEmoji, setMatchingEmoji] = useState<EmojiData | null>(null);
  const [emojiInput, setEmojiInput] = useState("");
  const [emojiColorData, setEmojiColorData] = useState<EmojiData[]>([]);
  const [loadingEmojis, setLoadingEmojis] = useState(true);
  const [error, setError] = useState(null);

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

  const handleEmojiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only keep the last character if it's an emoji
    if (value.length > 0) {
      const lastChar = value.slice(-1);
      const lastTwoChars = value.slice(-2);

      if (findEmojiByCharacter(lastTwoChars)) {
        setEmojiInput(lastTwoChars);
        const foundEmoji = findEmojiByCharacter(lastTwoChars);
        if (foundEmoji) {
          setColor(foundEmoji.hex);
        }
      } else if (findEmojiByCharacter(lastChar)) {
        setEmojiInput(lastChar);
        const foundEmoji = findEmojiByCharacter(lastChar);
        if (foundEmoji) {
          setColor(foundEmoji.hex);
        }
      } else {
        setEmojiInput(value.length === 1 ? value : lastChar);
      }
    } else {
      setEmojiInput("");
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

  const isSingleEmoji = (str: string) => {
    return (
      str.length === 1 ||
      (str.length === 2 && /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(str))
    );
  };

  const rgb = hexToRgb(color);

  if (loadingEmojis) return <p>Loading emojis...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Color Picker</CardTitle>
        <CardDescription>
          Select a color to find a matching emoji
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <HexColorPicker
              color={isValidColor ? color : "#CCCCCC"}
              onChange={setColor}
              className="w-full"
            />
          </div>
          <div className="flex flex-col justify-between space-y-4">
            <div
              className="w-full h-20 rounded-lg border shadow-sm overflow-hidden"
              style={{ backgroundColor: isValidColor ? color : "#CCCCCC" }}
            >
              {!isValidColor && (
                <div className="h-full w-full flex items-center justify-center bg-background/50 text-muted-foreground">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Invalid color</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hex-color">Hex Color</Label>
              <div className="flex">
                <Input
                  id="hex-color"
                  value={color}
                  onChange={handleInputChange}
                  className={`rounded-r-none ${
                    !isValidColor ? "border-red-500" : ""
                  }`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-none border-l-0"
                  onClick={copyToClipboard}
                  disabled={!isValidColor}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <Label>Red</Label>
            <div className="bg-red-500/30 h-1 w-full rounded-full">
              <div
                className="bg-red-700 h-1 rounded-full"
                style={{
                  width: isValidColor ? `${(rgb.r / 255) * 100}%` : "0%",
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-right">
              {isValidColor ? rgb.r : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Green</Label>
            <div className="bg-green-500/30 h-1 w-full rounded-full">
              <div
                className="bg-green-700 h-1 rounded-full"
                style={{
                  width: isValidColor ? `${(rgb.g / 255) * 100}%` : "0%",
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-right">
              {isValidColor ? rgb.g : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Blue</Label>
            <div className="bg-blue-500/30 h-1 w-full rounded-full">
              <div
                className="bg-blue-700 h-1 rounded-full"
                style={{
                  width: isValidColor ? `${(rgb.b / 255) * 100}%` : "0%",
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-right">
              {isValidColor ? rgb.b : "-"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="pt-2">
          <h3 className="text-sm font-medium mb-4">Matching Emoji</h3>

          {isValidColor && matchingEmoji ? (
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-background shadow-sm border">
                <span className="text-4xl">{matchingEmoji.emoji}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{matchingEmoji.name}</h4>
                <div className="flex items-center mt-1">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border"
                    style={{ backgroundColor: matchingEmoji.hex }}
                  ></div>
                  <span className="text-sm text-muted-foreground">
                    {matchingEmoji.hex}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-8 px-2"
                  onClick={copyEmojiToClipboard}
                >
                  {emojiCopied ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {emojiCopied ? "Copied!" : "Copy Emoji"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm italic">
              Enter a valid hex color to see the matching emoji
            </div>
          )}
        </div>

        <div className="pt-2">
          <Label htmlFor="emoji-input">Type an emoji</Label>
          <Input
            id="emoji-input"
            value={emojiInput}
            onChange={handleEmojiInputChange}
            placeholder="Enter an emoji to find its color"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
