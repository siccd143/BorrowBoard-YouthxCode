"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type AnimatedShaderBackgroundProps = {
  className?: string;
  onReady?: () => void;
};

export default function AnimatedShaderBackground({ className, onReady }: AnimatedShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 3

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u * u * (3.0 - 2.0 * u);
          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
            u.y
          );
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.34;
          vec2 shift = vec2(100.0);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.42;
          }
          return v;
        }

        void main() {
          vec2 p = (gl_FragCoord.xy - iResolution.xy * 0.5) / max(iResolution.y, 1.0);
          p *= mat2(3.4, -2.1, 2.1, 3.4);

          vec4 color = vec4(0.0);
          float flow = fbm(p * 1.2 + vec2(iTime * 0.15, -iTime * 0.06));

          for (float i = 0.0; i < 28.0; i++) {
            vec2 v = p + cos(i * i + iTime * 0.018 + p.x * 0.08 + i * vec2(8.0, 5.0)) * 2.8;
            float ribbon = exp(sin(i * 0.72 + iTime * 0.35)) / length(max(v, vec2(v.x * (0.025 + flow * 0.02), v.y * 1.45)));
            vec3 warmInk = mix(vec3(0.97, 0.55, 0.20), vec3(0.35, 0.28, 0.95), smoothstep(0.0, 1.0, sin(i * 0.2 + flow)));
            warmInk = mix(warmInk, vec3(0.08, 0.86, 0.68), smoothstep(0.35, 0.95, flow) * 0.45);
            color.rgb += warmInk * ribbon * smoothstep(0.0, 1.0, i / 28.0) * 0.018;
          }

          color.rgb = tanh(pow(color.rgb, vec3(1.2)));
          color.a = 0.72;
          gl_FragColor = color;
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    container.appendChild(renderer.domElement);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height, false);
      material.uniforms.iResolution.value.set(width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    let frameId = 0;
    const animate = () => {
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
      if (onReadyRef.current) {
        onReadyRef.current();
        onReadyRef.current = undefined;
      }
      frameId = requestAnimationFrame(animate);
    };
    renderer.compile(scene, camera);
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
