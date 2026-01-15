<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    AbstractMesh,
    ArcRotateCamera,
    Color3,
    Color4,
    DirectionalLight,
    Engine,
    HemisphericLight,
    Scene,
    StandardMaterial,
    TransformNode,
    Vector3
  } from "@babylonjs/core";
  import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
  import "@babylonjs/loaders/glTF";
  import "@babylonjs/loaders/OBJ";
  import "@babylonjs/loaders/STL";

  interface Props {
    modelUrl: string;
  }

  let { modelUrl }: Props = $props();

  let canvasElement: HTMLCanvasElement;
  let engine: Engine | null = null;
  let scene: Scene | null = null;
  let camera: ArcRotateCamera | null = null;
  let handleResize: (() => void) | null = null;
  let isDragging = $state(false);

  onMount(async () => {
    if (!canvasElement || !modelUrl) return;

    try {
      engine = new Engine(canvasElement, true, {
        preserveDrawingBuffer: true,
        stencil: true
      });

      scene = new Scene(engine);
      scene.clearColor = new Color4(0.1, 0.1, 0.1, 1.0);

      camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.5,
        10,
        Vector3.Zero(),
        scene
      );
      camera.attachControl(canvasElement, true);
      camera.setTarget(Vector3.Zero());
      camera.lowerRadiusLimit = 0.1;
      camera.upperRadiusLimit = 1000;
      camera.wheelDeltaPercentage = 0.01;
      camera.panningSensibility = 0;
      scene.activeCamera = camera;

      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -1, -1), scene);
      light.intensity = 1.0;
      dirLight.intensity = 0.5;

      engine.runRenderLoop(() => {
        if (scene) {
          scene.render();
        }
      });

      const assetContainer = await LoadAssetContainerAsync(modelUrl, scene);
      if (!assetContainer) {
        throw new Error("Failed to load asset container");
      }
      assetContainer.addAllToScene();

      const renderMeshes = assetContainer.meshes.filter((m) => m.getTotalVertices() > 0);
      assetContainer.meshes.forEach((mesh: AbstractMesh, index: number) => {
        mesh.setEnabled(true);
        mesh.isVisible = true;

        if (!mesh.material && scene) {
          const defaultMat = new StandardMaterial(`defaultMat_${index}`, scene);
          defaultMat.diffuseColor = new Color3(0.8, 0.8, 0.8);
          mesh.material = defaultMat;
        }
      });

      if (renderMeshes.length > 0) {
        const modelPivot = new TransformNode("modelPivot", scene);
        renderMeshes.forEach((m) => m.setParent(modelPivot, true, true));
        modelPivot.computeWorldMatrix(true);
        const preBounds = modelPivot.getHierarchyBoundingVectors(
          true,
          (m) => m.getTotalVertices() > 0
        );
        const center = Vector3.Center(preBounds.min, preBounds.max);
        const size = preBounds.max.subtract(preBounds.min);
        const maxDimension = Math.max(size.x, size.y, size.z);

        if (maxDimension > 0) {
          const desiredSize = 10;
          const scale = desiredSize / maxDimension;

          modelPivot.scaling = new Vector3(scale, scale, scale);
          modelPivot.position = center.scale(-scale);
          modelPivot.computeWorldMatrix(true);

          const postBounds = modelPivot.getHierarchyBoundingVectors(
            true,
            (m) => m.getTotalVertices() > 0
          );
          const postSize = postBounds.max.subtract(postBounds.min);
          const postMaxDimension = Math.max(postSize.x, postSize.y, postSize.z);

          camera.useFramingBehavior = false;
          camera.setTarget(Vector3.Zero());

          const radius = Math.max(postMaxDimension * 1.5, 3);
          camera.radius = radius;

          const upperLimit = Math.max(radius * 4, radius + 5);
          camera.lowerRadiusLimit = 0.01;
          camera.upperRadiusLimit = upperLimit;
          camera.minZ = 0.01;
          camera.maxZ = camera.upperRadiusLimit * 5;

          camera.zoomOn(renderMeshes, true);
          camera.maxZ = camera.upperRadiusLimit * 5;
        } else {
          camera.setTarget(Vector3.Zero());
          camera.radius = 10;
        }
      } else {
        console.warn("No renderable meshes found (0 vertices)");
        camera.setTarget(Vector3.Zero());
        camera.radius = 10;
      }

      handleResize = () => {
        if (engine) {
          engine.resize();
        }
      };
      window.addEventListener("resize", handleResize);
    } catch (error) {
      console.error("Error loading model:", error);
    }
  });

  onDestroy(() => {
    if (handleResize) {
      window.removeEventListener("resize", handleResize);
    }
    if (camera) {
      camera.detachControl();
    }
    if (engine) {
      engine.dispose();
    }
    if (scene) {
      scene.dispose();
    }
  });
</script>

<canvas
  bind:this={canvasElement}
  class="block w-full h-full touch-none"
  class:cursor-grab={!isDragging}
  class:cursor-grabbing={isDragging}
  onpointerdown={() => (isDragging = true)}
  onpointerup={() => (isDragging = false)}
  onpointerleave={() => (isDragging = false)}
  onpointercancel={() => (isDragging = false)}
></canvas>
