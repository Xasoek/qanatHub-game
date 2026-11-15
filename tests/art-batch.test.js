import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {batchStatic}from "../src/art/batch.js";
test("batching preserves vertex colors and mirrored triangle corner colors",()=>{
 const root=new THREE.Group(), material=new THREE.MeshStandardMaterial({vertexColors:true});
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute("position",new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));
 geometry.setAttribute("normal",new THREE.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));
 geometry.setAttribute("color",new THREE.Float32BufferAttribute([1,0,0,0,1,0,0,0,1],3));
 const a=new THREE.Mesh(geometry,material),b=new THREE.Mesh(geometry.clone(),material);b.scale.x=-1;
 root.add(a,b);batchStatic(THREE,root);
 assert.equal(root.children.length,1);
 const colors=root.children[0].geometry.attributes.color;
 assert.equal(colors.count,6);
 assert.deepEqual([...colors.array],[1,0,0,0,1,0,0,0,1,1,0,0,0,0,1,0,1,0]);
});
