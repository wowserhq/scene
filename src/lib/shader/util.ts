const composeShader = (
  precision: string,
  uniforms: { name: string; type: string }[],
  inputs: { name: string; type: string }[],
  outputs: { name: string; type: string }[],
  functions: string[],
  main: string[],
) => {
  const lines = [];

  lines.push(`precision ${precision};`);

  lines.push('');
  lines.push(...uniforms.map((uniform) => `uniform ${uniform.type} ${uniform.name};`));

  lines.push('');
  lines.push(...inputs.map((input) => `in ${input.type} ${input.name};`));

  lines.push('');
  lines.push(...outputs.map((output) => `out ${output.type} ${output.name};`));

  lines.push('');
  lines.push(...functions);

  lines.push('');
  lines.push('void main() {');
  lines.push(...main);
  lines.push('}');

  lines.push('');

  return lines.join('\n');
};

export { composeShader };
