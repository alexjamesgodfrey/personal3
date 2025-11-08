export function RenderCell({ id }: { id: string }) {
  console.log('renderCell', id);
  switch (id) {
    case 'conquer-biomark':
      return <img src="/images/conquer-biomark.png" alt="Conquer Biomark" />;
    default:
      return null;
  }
}
