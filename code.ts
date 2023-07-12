figma.showUI(__html__, { width: 240, height: 180 });

figma.ui.onmessage = async msg => {
  if (msg.type === 'create-flow') {
    const nodes = figma.currentPage.selection;

    if (!nodes || nodes.length < 2) {
      figma.ui.postMessage({ type: 'error', message: 'Selecione pelo menos duas camadas para criar um fluxo.' });
      return;
    }

    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });

    const lines: LineNode[] = [];
    const textNodes: TextNode[] = [];

    const lineType = msg.lineType === 'dashed' ? 'dashed' : 'solid';

    for (let i = 0; i < nodes.length - 1; i++) {
      const startNode = nodes[i] as FrameNode;
      const endNode = nodes[i + 1] as FrameNode;

      const group = figma.group([startNode], figma.currentPage);
      group.name = msg.lineName || 'Nome da Linha';

      const line = figma.createLine();
      line.strokeWeight = 14;

      if (lineType === 'dashed') {
        line.dashPattern = [14, 8];
        line.strokes = getLineStrokes({ r: 0.5, g: 0.5, b: 0.5 });
      } else {
        line.strokes = getLineStrokes({ r: 0.5, g: 0.5, b: 0.5 });
      }

      const lineWidth = Math.max(endNode.x - startNode.x - startNode.width, 2, 0.01);
      line.resizeWithoutConstraints(lineWidth, 0);
      line.x = startNode.x + startNode.width;
      line.y = startNode.y + startNode.height / 2;
      group.appendChild(line);
      lines.push(line);

      const textNode = figma.createText();
      textNode.fontName = { family: 'Inter', style: 'Medium' };
      textNode.characters = msg.lineName || '';
      textNode.x = line.x + line.width / 2 - textNode.width / 2;
      textNode.y = line.y - textNode.height / 2;
      group.appendChild(textNode);
      textNodes.push(textNode);
      textNode.fontSize = 64;
    }

    figma.ui.postMessage({ type: 'success', message: 'Fluxo criado com sucesso!' });

    // Função para atualizar as posições das linhas
    const updateLinePositions = () => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const textNode = textNodes[i];
        const startNode = nodes[i] as FrameNode;
        const endNode = nodes[i + 1] as FrameNode;

        const lineWidth = Math.max(endNode.x - startNode.x - startNode.width, 2, 0.01);
        line.resizeWithoutConstraints(lineWidth, 0);
        line.x = startNode.x + startNode.width;
        line.y = startNode.y + startNode.height / 2;

        textNode.x = line.x + line.width / 2 - textNode.width / 2;
        textNode.y = line.y - textNode.height / 2 - 65;
      }
    };

    // Registrar updateLinePositions para ser chamado em selectionchange e documentchange
    figma.on('selectionchange', updateLinePositions);
    figma.on('documentchange', updateLinePositions);
  }
};

function getLineStrokes(color: RGB): ReadonlyArray<Paint> {
  return [{ type: 'SOLID', color }];
}
