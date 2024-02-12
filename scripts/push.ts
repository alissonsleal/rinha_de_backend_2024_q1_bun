import { $ } from 'bun'

console.log('Building docker image...')
await $`docker build -t alissonsleal/rinha-de-backend-2024-q1-bun .`
console.log('Docker image built successfully!')

console.log('Pushing docker image...')
await $`docker push alissonsleal/rinha-de-backend-2024-q1-bun:latest`
console.log('Docker image pushed successfully!')
