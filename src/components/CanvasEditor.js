/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";
import { SketchPicker } from "react-color";

class CanvasManager {
  constructor(canvas, template) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.template = template;
    this.image = null;
    this.bgColor = "#ffffff"; // Default background color
  }

  setBackground(color) {
    this.bgColor = color;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImage(imageFile, callback) {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        this.image = img; // Store the image for redrawing
        this.redrawCanvas();
        if (typeof callback === "function") {
          callback();
        }
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(imageFile);
  }

  updateText(caption, callToAction) {
    this.redrawCanvas();
    this.setText(caption, callToAction);
  }

  redrawCanvas() {
    this.setBackground(this.bgColor);
    if (this.image) {
      this.drawStoredImage();
    }
  }

  drawStoredImage() {
    const padding = 15;
    const availableWidth = this.canvas.width - 6 * padding;
    const availableHeight =
      this.canvas.height -
      6 * padding -
      this.template.caption.height -
      this.template.cta.height -
      30; // 30 for spacing between elements
    const imageAspectRatio = this.image.width / this.image.height;
    const canvasAspectRatio = availableWidth / availableHeight;

    let imageWidth, imageHeight;

    if (imageAspectRatio > canvasAspectRatio) {
      imageWidth = availableWidth;
      imageHeight = imageWidth / imageAspectRatio;
    } else {
      imageHeight = availableHeight;
      imageWidth = imageHeight * imageAspectRatio;
    }

    const centerX = (this.canvas.width - imageWidth) / 2;
    const centerY = padding;

    this.ctx.drawImage(this.image, centerX, centerY, imageWidth, imageHeight);
  }

  setText(caption, callToAction) {
    // Set caption styles
    this.ctx.font = `${this.template.caption.font_size}px Arial`;
    this.ctx.fillStyle = this.template.caption.text_color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Calculate caption position
    const captionX = this.canvas.width / 2;
    const captionY =
      this.canvas.height -
      this.template.cta.height -
      this.template.caption.height -
      this.template.caption.height; // Adding margin-bottom

    // Draw caption
    this.drawText(caption, captionX, captionY, this.template.caption.max_width);

    // Set call-to-action styles
    this.ctx.font = `${this.template.cta.font_size}px Arial`;
    this.ctx.fillStyle = this.template.cta.text_color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Draw call-to-action background
    const ctaX = this.canvas.width / 2;
    const ctaY = this.canvas.height - this.template.cta.height / 2 - 30; // Adding margin-bottom
    const ctaWidth = this.template.cta.width;
    const ctaHeight = this.template.cta.height;

    this.ctx.fillStyle = this.template.cta.background_color;
    this.ctx.fillRect(
      ctaX - ctaWidth / 2,
      ctaY - ctaHeight / 2,
      ctaWidth,
      ctaHeight
    );

    // Draw call-to-action text
    this.ctx.fillStyle = this.template.cta.text_color;
    this.ctx.fillText(callToAction, ctaX, ctaY);
  }

  drawText(text, x, y, maxWidth) {
    const words = text.split(" ");
    let line = "";
    const lineHeight = this.template.caption.font_size * 1.2;
    const lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = this.ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    for (let i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i], x, y + i * lineHeight);
    }
  }
}

const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const [canvasManager, setCanvasManager] = useState(null);
  const [bgColor, setBgColor] = useState("#0369A1");
  const [caption, setCaption] = useState(
    "1 & 2 BHK Luxury Apartments at just Rs.34.97 Lakhs"
  );
  const [callToAction, setCallToAction] = useState("Shop Now");
  const [image, setImage] = useState(null);
  const template = {
    caption: {
      text: "1 & 2 BHK Luxury Apartments at just Rs.34.97 Lakhs",
      font_size: 44,
      text_color: "#FFFFFF",
      background_color: "#8F9785",
      position: { x: 540, y: 900 },
      max_width: 750,
      height: 80,
    },
    cta: {
      text: "Shop Now",
      font_size: 44,
      text_color: "#000000",
      background_color: "#8F9785",
      width: 400,
      height: 40,
      max_width: 750,
    },
    image_mask: {
      x: 56,
      y: 442,
      width: 970,
      height: 200, // Set height to 200 as per your requirement
    },
    urls: {
      mask: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_mask.png",
      stroke:
        "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Mask_stroke.png",
      design_pattern:
        "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Design_Pattern.png",
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const manager = new CanvasManager(canvas, template);
    setCanvasManager(manager);
    manager.setBackground(bgColor);
  }, []);

  useEffect(() => {
    if (canvasManager) {
      canvasManager.setBackground(bgColor);
      canvasManager.updateText(caption, callToAction);
    }
  }, [bgColor, caption, callToAction, canvasManager]);

  useEffect(() => {
    if (canvasManager && image) {
      canvasManager.drawImage(image, () => {
        canvasManager.updateText(caption, callToAction);
      });
    }
  }, [image, caption, callToAction, canvasManager]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imgFile = e.target.files[0];
      setImage(imgFile);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 h-1/2 md:h-full bg-gray-200 p-4 md:p-8 rounded-lg shadow-lg">
        <canvas
          ref={canvasRef}
          width={1080}
          height={1080}
          style={{ width: 400, maxWidth: 500, height: "auto" }}
          className="border border-gray-300 shadow-2xl rounded-lg"
        ></canvas>
      </div>

      <div className="w-full md:w-1/2 p-4 md:p-8 bg-white rounded-lg shadow-lg overflow-y-auto">
        <div className="text-2xl font-semibold mb-4">Add Customization</div>
        <div className="text-teal-800 mb-6">
          Customize your ad and get the template accordingly
        </div>
        <div className="relative mb-5 text-slate-500 flex flex-row">
          <label className="mt-2 text-sm font-semibold mx-2 text-teal-800">
            Change ad creative image
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            className="border p-2 bg-white rounded-lg"
          />
        </div>
        <div className="flex flex-row mb-5">
          <p className="w-1/4 text-sm font-semibold m-2 text-teal-800">
            Colour Palette
          </p>
          <SketchPicker
            color={bgColor}
            onChangeComplete={(color) => setBgColor(color.hex)}
            className="w-3/4 shadow-md rounded-lg"
          />
        </div>
        <div className="flex flex-row mb-5">
          <label className="w-1/4 text-sm font-semibold  text-teal-800">
            Caption
          </label>
          <input
            type="text"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-3/4 border p-2 bg-slate-300 rounded-lg focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500 transition duration-200"
          />
        </div>
        <div className="flex flex-row mb-5">
          <label className="w-1/4 text-sm font-semibold text-teal-800">
            Call to Action
          </label>
          <input
            type="text"
            placeholder="Call to Action"
            value={callToAction}
            onChange={(e) => setCallToAction(e.target.value)}
            className="border p-2 bg-slate-300 rounded-lg focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500 transition duration-200 w-3/4"
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
