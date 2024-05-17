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
      this.applyMask();
      this.drawText(this.template.caption.text, this.template.cta.text);

      // Calculate the width and height of the image
      const canvasHeight = this.canvas.height;
      const imageHeight = (3 / 4) * canvasHeight;
      const imageWidth = (3 / 4) * canvasHeight;

      // Calculate the coordinates to center the image
      const centerX = (this.canvas.width - imageWidth) / 2;
      const centerY = (this.canvas.height - imageHeight) / 2;

      // Draw the image at the calculated coordinates with fixed dimensions
      this.ctx.drawImage(this.image, centerX, centerY, imageWidth, imageHeight);
    };
  }

  applyMask() {
    const mask = new Image();
    mask.crossOrigin = "anonymous";
    mask.src = `${this.template.urls.mask}?random=${Math.random()}`;
    mask.onload = () => {
      this.ctx.drawImage(mask, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = "source-in";
      this.ctx.drawImage(
        this.image,
        this.template.image_mask.x,
        this.template.image_mask.y,
        this.template.image_mask.width,
        900 // Set height to 900 as per your requirement
      );
      this.ctx.globalCompositeOperation = "source-over";
      this.drawMaskStroke();
    };
  }

  drawMaskStroke() {
    const maskStroke = new Image();
    maskStroke.crossOrigin = "anonymous";
    maskStroke.src = `${this.template.urls.stroke}?random=${Math.random()}`;
    maskStroke.onload = () => {
      this.ctx.drawImage(
        maskStroke,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    };
  }

  setText(caption, callToAction) {
    this.ctx.font = `${this.template.caption.font_size}px Arial`;
    this.ctx.fillStyle = this.template.caption.text_color;
    this.drawText(
      caption,
      this.template.caption.position.x,
      this.template.caption.position.y,
      this.template.caption.max_characters_per_line
    );

    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = this.template.cta.text_color;
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = this.template.cta.background_color;
    this.ctx.fillRect(
      this.template.cta.position.x - 100,
      this.template.cta.position.y - 20,
      200,
      50
    );
    this.ctx.fillStyle = this.template.cta.text_color;
    this.ctx.fillText(
      callToAction,
      this.template.cta.position.x,
      this.template.cta.position.y + 10
    );
  }

  drawText(text, x, y, maxCharsPerLine) {
    const words = text.split(" ");
    let line = "";
    let yPos = y;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = this.ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxCharsPerLine && n > 0) {
        this.ctx.fillText(line, x, yPos);
        line = words[n] + " ";
        yPos += this.template.caption.font_size;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, yPos);
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
      position: { x: 50, y: 50 },
      max_characters_per_line: 31,
      font_size: 44,
      text_color: "#FFFFFF",
    },
    cta: {
      text: "Shop Now",
      position: { x: 190, y: 320 },
      text_color: "#FFFFFF",
      background_color: "#000000",
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
      if (image) {
        canvasManager.drawImage(image);
      } else {
        canvasManager.setText(caption, callToAction);
      }
    }
  }, [bgColor, caption, callToAction, image, canvasManager]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imgFile = e.target.files[0];
      setImage(imgFile);
      if (canvasManager) {
        canvasManager.drawImage(imgFile);
      }
    }
  };

  return (
    <div className="flex flex-row">
      <div className="flex flex-col justify-center items-center w-1/2 h-screen bg-gray-200 p-8">
        <canvas
          ref={canvasRef}
          width={1080}
          height={1080}
          style={{ width: 400, height: 400 }}
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
