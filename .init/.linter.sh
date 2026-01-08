#!/bin/bash
cd /home/kavia/workspace/code-generation/interactive-graph-visualization-43721-43730/graph_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

