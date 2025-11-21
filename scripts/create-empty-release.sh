#!/bin/bash
# Script para criar release vazia para testes

curl -X POST \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/ThroneWild/colonial-asset-qr/releases \
  -d '{
    "tag_name": "v1.0.1",
    "name": "Release v1.0.1",
    "body": "Primeira release - Build em andamento",
    "draft": false,
    "prerelease": false
  }'
