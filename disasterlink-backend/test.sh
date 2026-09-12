#!/bin/bash
echo "🚀 Firing live cloud verification test..."
curl -X POST "https://amazonaws.com" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Severe Flash Flooding near Balaju",
    "location": "Balaju Corridor",
    "severity": "Critical",
    "peopleAffected": 120,
    "waterLevel": 4.5,
    "description": "River overflowing onto the main roads. Several residents trapped."
  }'
echo -e "\n\n✅ Test execution completed!"
