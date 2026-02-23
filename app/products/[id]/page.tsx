interface Props {
  params: {
    id: string;
  };
}

export default function ProductDetail({ params }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold">Détail produit {params.id}</h2>
    </div>
  );
}
