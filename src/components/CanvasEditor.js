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
    this.clearCanvas();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImage(image) {
    this.image = new Image();
    this.image.src = URL.createObjectURL(image);
    this.image.onload = () => {
      this.clearCanvas();
      this.setBackground(this.bgColor);

      const padding = 15;
      const availableWidth = this.canvas.width - 2 * padding;
      const availableHeight =
        this.canvas.height -
        2 * padding -
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

      this.setText(
        this.template.caption.text,
        this.template.cta.text,
        centerY + imageHeight + 15
      ); // Adjusting the position of text below the image
    };
  }

  updateText(caption, callToAction) {
    if (this.image) {
      this.drawImage(this.image);
    } else {
      this.clearCanvas();
      this.setBackground(this.bgColor);
      this.setText(caption, callToAction, 60); // Ensure text is set at the start
    }
  }

  setText(caption, callToAction, textStartY) {
    // Set caption styles
    this.ctx.font = `${this.template.caption.font_size}px Arial`;
    this.ctx.fillStyle = this.template.caption.text_color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Calculate caption position
    const captionX = this.canvas.width / 2;
    const captionY = textStartY;

    // Draw caption
    this.drawText(caption, captionX, captionY, this.template.caption.max_width);

    // Set call-to-action styles
    this.ctx.font = `${this.template.cta.font_size}px Arial`;
    this.ctx.fillStyle = this.template.cta.text_color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Draw call-to-action background
    const ctaX = this.canvas.width / 2;
    const ctaY = captionY + this.template.caption.font_size + 20; // 20 for spacing between caption and CTA
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
      max_width: 960,
      height: 60,
      offset_bottom: 100,
    },
    cta: {
      text: "Shop Now",
      font_size: 44,
      text_color: "#FFFFFF",
      background_color: "#8F9785",
      width: 250,
      height: 60,
      max_width: 960,
      offset_bottom: 40,
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
      canvasManager.drawImage(image);
    }
  }, [image, canvasManager]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imgFile = e.target.files[0];
      setImage(imgFile);
    }
  };

  return (
    <div className="flex flex-row">
      <div className="flex flex-col justify-center items-center w-1/2 h-screen bg-gray-200 p-8">
        <canvas
          ref={canvasRef}
          width={1080}
          height={1080}
          style={{ width: 500, height: 500 }}
          className="flex justify-center items-center border"
        ></canvas>
      </div>

      <div className="w-1/2 p-8">
        <div className="text-2xl font-semibold">Add Customization</div>
        <div className="text-teal-600">
          Customize your ad and get the template accordingly
        </div>
        <div className="relative my-5 text-slate-500">
          <p className="absolute left-0 top-0">Change ads creative image</p>
          <input
            type="file"
            onChange={handleImageChange}
            className="border relative right-0 top-0"
          />
        </div>
        <div className="flex flex-row">
          <p className="text-teal-600 mr-5 font-medium">Colour palette</p>
          <SketchPicker
            color={bgColor}
            onChangeComplete={(color) => setBgColor(color.hex)}
          />
        </div>
        <div className="flex flex-col my-5">
          <input
            type="text"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="border p-2 bg-slate-300 rounded-lg"
          />
        </div>
        <input
          type="text"
          placeholder="Call to Action"
          value={callToAction}
          onChange={(e) => setCallToAction(e.target.value)}
          className="border p-2 bg-slate-300 rounded-lg"
        />
      </div>
    </div>
  );
};

export default CanvasEditor;
