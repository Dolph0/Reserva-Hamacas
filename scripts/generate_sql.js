const fs = require('fs');

function generateSQL() {
  let sql = `-- Clear existing hamacas for sector azul\nDELETE FROM public.hamacas WHERE sector = 'azul';\n\n`;
  sql += `INSERT INTO public.hamacas (id, sector, number, x_relative, y_relative, price_base, status) VALUES\n`;

  const values = [];
  let number = 1;

  // The 7 physical rows are spaced out more vertically
  const startY = 22;
  const endY = 65; // Increased from 48 to add more vertical space between rows
  const numRows = 7;
  const stepY = (endY - startY) / (numRows - 1);
  
  const centerYs = Array.from({length: numRows}, (_, i) => startY + i * stepY);
  
  const curveAmount = 4; // Y difference between edge and center

  for (let r = 0; r < centerYs.length; r++) {
    const centerY = centerYs[r];
    const numPositions = 14; // Exactly 14 evenly spaced positions
    
    const startX = 3.5;
    const endX = 96.5;
    const stepX = (endX - startX) / (numPositions - 1);

    for (let i = 0; i < numPositions; i++) {
      const x = startX + i * stepX;
      
      const normalizedPos = (i - (numPositions - 1) / 2) / ((numPositions - 1) / 2);
      const y = centerY + Math.pow(normalizedPos, 2) * curveAmount;
      
      values.push(`(gen_random_uuid(), 'azul', ${number++}, ${x.toFixed(2)}, ${y.toFixed(2)}, 20, 'available')`);
    }
  }

  sql += values.join(',\n') + ';\n';

  fs.writeFileSync('insert_hamacas.sql', sql);
  console.log(`Generated SQL for ${values.length} hamacas in insert_hamacas.sql`);
}

generateSQL();
