// import { useEffect, useRef, useState } from "react";

// export function useLive2DModel(
//   canvasId = "live2d-canvas",
//   modelPath = "/models/hiyori/runtime/hiyori_free_t08.model3.json",
//   motionPath = "/models/hiyori/runtime/motion/hiyori_m04.motion3.json"
// ) {
//   const canvasRef = useRef(null);
//   const modelRef = useRef(null);
//   const appRef = useRef(null);
//   const [isModelLoaded, setIsModelLoaded] = useState(false);

//   useEffect(() => {
//     const checkScripts = () => {
//       if (typeof window.PIXI !== "undefined" && window.PIXI.live2d) {
//         const PIXI = window.PIXI;
//         const canvas = document.querySelector(`#${canvasId}`);
//         if (!canvas) return;

//         const app = new PIXI.Application({
//           view: canvas,
//           autoStart: true,
//           backgroundAlpha: 0,
//           resizeTo: window,
//         });
//         appRef.current = app;

//         PIXI.live2d.Live2DModel.from(modelPath).then((loadedModel) => {
//           const scaleX = (window.innerWidth * 1.4) / loadedModel.width;
//           const scaleY = (window.innerHeight * 1.4) / loadedModel.height;
//           loadedModel.scale.set(scaleX, scaleY);
//           loadedModel.x = window.innerWidth - loadedModel.width + 800;
//           loadedModel.y = window.innerHeight - loadedModel.height + 600;

//           app.stage.addChild(loadedModel);
//           modelRef.current = loadedModel;
//           setIsModelLoaded(true); // Set loading state to true when model is loaded

//           const intervalId = setInterval(() => {
//             playMotion();
//           }, 5000);

//           return () => clearInterval(intervalId);
//         });
//       } else {
//         setTimeout(checkScripts, 300);
//       }
//     };

//     checkScripts();

//     return () => {
//       if (appRef.current) {
//         appRef.current.destroy(true);
//       }
//     };
//   }, [canvasId, modelPath]);

//   useEffect(() => {
//     if (isModelLoaded) {
//       playMotion(); // Play motion immediately after model is loaded
//     }
//   }, [isModelLoaded]);

//   const playMotion = async () => {
//     const model = modelRef.current;
//     if (!model) return;

//     try {
//       console.log("Motion triggered");
//       const response = await fetch(motionPath);
//       const motionJson = await response.json();

//       model.motion(motionJson, false, window.PIXI.live2d.MotionPriority.NORMAL);

//       console.log("Motion played");
//     } catch (err) {
//       console.error("Error loading motion:", err);
//     }
//   };

//   return { canvasRef, playMotion, isModelLoaded };
// }
