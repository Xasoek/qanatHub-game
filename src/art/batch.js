// Static batching: merges non-moving meshes that share a material (and pick ID) into one mesh.
// Same geometry and materials, far fewer draw calls. Moving parts are skipped by the caller.
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function batchStatic(THREE, root, skip = () => false) {
  root.updateMatrixWorld(true);
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  (function walk(object) {
    if (object !== root && skip(object)) return;
    if (object.isMesh && !object.isInstancedMesh && !object.isSkinnedMesh && !Array.isArray(object.material) &&
      object.geometry?.attributes.position && object.geometry.attributes.normal && object.visible) {
      const key = `${object.material.uuid}|${object.userData.objectId ?? ""}|${object.castShadow}|${object.receiveShadow}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(object);
    }
    for (const child of object.children) walk(child);
  })(root);

  let merged = 0, removed = 0;
  const matrix = new THREE.Matrix4();
  for (const meshes of buckets.values()) {
    if (meshes.length < 2) continue;
    const parts = [];
    for (const mesh of meshes) {
      matrix.multiplyMatrices(toRoot, mesh.matrixWorld);
      let g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      // A vertex-coloured mesh must retain its RGB data after merging.
      // Without it Three.js fills the missing attribute with black.
      const attributes=mesh.material.vertexColors?["position","normal","uv","color"]:["position","normal","uv"];
      for(const name of Object.keys(g.attributes))if(!attributes.includes(name))g.deleteAttribute(name);
      if(mesh.material.vertexColors&&!g.attributes.color){
        const colors=new Float32Array(g.attributes.position.count*3).fill(1);
        g.setAttribute("color",new THREE.BufferAttribute(colors,3));
      }
      if (!g.attributes.uv) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g.morphAttributes = {};
      g.applyMatrix4(matrix);
      // A mirrored transform flips triangle winding; restore it so front faces stay outward.
      if (matrix.determinant() < 0) {
        const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
        for (let i = 0; i < p.count; i += 3) for (const a of [p, n, u, ...(g.attributes.color?[g.attributes.color]:[])]) {
          const s = a.itemSize, arr = a.array;
          for (let k = 0; k < s; k++) { const t = arr[(i + 1) * s + k]; arr[(i + 1) * s + k] = arr[(i + 2) * s + k]; arr[(i + 2) * s + k] = t; }
        }
      }
      parts.push(g);
    }
    const geometry = mergeGeometries(parts, false);
    parts.forEach((g) => g.dispose());
    if (!geometry) continue;
    const first = meshes[0];
    const mesh = new THREE.Mesh(geometry, first.material);
    mesh.castShadow = first.castShadow;
    mesh.receiveShadow = first.receiveShadow;
    mesh.userData.objectId = first.userData.objectId;
    mesh.userData.batched = true;
    root.add(mesh);
    for (const old of meshes) {
      // Batching runs before the first frame, so the old geometry was never uploaded; clones may still share it.
      old.parent.remove(old);
      removed++;
    }
    merged++;
  }
  return { merged, removed };
}
