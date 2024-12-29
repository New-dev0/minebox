import * as THREE from 'three'

export class Smoke {
  mesh: THREE.Mesh
  velocity: THREE.Vector3

  constructor() {
    const geometry = new THREE.SphereGeometry(2, 32, 32)
    const material = new THREE.MeshPhongMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.6
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.velocity = new THREE.Vector3(
      Math.random() * 0.2 - 0.1,
      Math.random() * 0.2,
      Math.random() * 0.2 - 0.1
    )
  }

  update() {
    this.mesh.position.add(this.velocity)
  }
} 