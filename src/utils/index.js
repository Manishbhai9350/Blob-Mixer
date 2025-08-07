import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { degToRad } from "three/src/math/MathUtils.js";



export function GetSceneBounds(renderer = new WebGLRenderer(),camera = new PerspectiveCamera()){
    const aspect = camera.aspect;
    const z = camera.position.z;
    const theta = degToRad(camera.fov) / 2;
    const height = Math.tan(theta) * z * 2;
    const width =  height * aspect;
    return {width,height}
}


export function computeTangentsForNonIndexed(geometry) {
  const posAttr = geometry.attributes.position;
  const uvAttr = geometry.attributes.uv;
  const normalAttr = geometry.attributes.normal;

  const vertexCount = posAttr.count;
  const tangents = new Float32Array(vertexCount * 4); // vec4 per vertex

  for (let i = 0; i < vertexCount; i += 3) {
    const i0 = i;
    const i1 = i + 1;
    const i2 = i + 2;

    const v0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
    const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
    const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);

    const uv0 = new THREE.Vector2().fromBufferAttribute(uvAttr, i0);
    const uv1 = new THREE.Vector2().fromBufferAttribute(uvAttr, i1);
    const uv2 = new THREE.Vector2().fromBufferAttribute(uvAttr, i2);

    const deltaPos1 = v1.clone().sub(v0);
    const deltaPos2 = v2.clone().sub(v0);

    const deltaUV1 = uv1.clone().sub(uv0);
    const deltaUV2 = uv2.clone().sub(uv0);

    const r = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV1.y * deltaUV2.x);
    const tangent = deltaPos1.clone().multiplyScalar(deltaUV2.y)
                     .sub(deltaPos2.clone().multiplyScalar(deltaUV1.y))
                     .multiplyScalar(r)
                     .normalize();

    // Bitangent can be used to compute handedness
    const bitangent = deltaPos2.clone().multiplyScalar(deltaUV1.x)
                       .sub(deltaPos1.clone().multiplyScalar(deltaUV2.x))
                       .multiplyScalar(r)
                       .normalize();

    for (const j of [i0, i1, i2]) {
      const normal = new THREE.Vector3().fromBufferAttribute(normalAttr, j);
      const t = tangent.clone().sub(normal.clone().multiplyScalar(normal.dot(tangent))).normalize();
      const w = (normal.clone().cross(tangent).dot(bitangent) < 0.0) ? -1.0 : 1.0;

      tangents[j * 4 + 0] = t.x;
      tangents[j * 4 + 1] = t.y;
      tangents[j * 4 + 2] = t.z;
      tangents[j * 4 + 3] = w;
    }
  }

  geometry.setAttribute('tangent', new THREE.BufferAttribute(tangents, 4));
}
