import OrbitControls from '../../lib/controls/OrbitControls';
import { describe, expect, test } from 'vitest';
import * as THREE from 'three';

const getRenderer = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
};

const getPerspectiveCamera = () =>
  new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1277.0);

describe('OrbitControls', () => {
  describe('update', () => {
    test('should return false (not changed) with default target and time delta of 0', () => {
      const renderer = getRenderer();
      document.body.appendChild(renderer.domElement);

      const camera = getPerspectiveCamera();

      const controls = new OrbitControls(camera, renderer.domElement);

      expect(controls.update(0)).toBe(false);
    });

    test('should return true (changed) with non-default target and time delta of 0', () => {
      const renderer = getRenderer();
      document.body.appendChild(renderer.domElement);

      const camera = getPerspectiveCamera();

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target = new THREE.Vector3(1, 1, 1);

      expect(controls.update(0)).toBe(true);
    });
  });
});
