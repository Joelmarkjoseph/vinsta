import { useParams } from "react-router-dom";

function ImageDetail() {
  const { id } = useParams();
  return <h1>Viewing Image ID: {id}</h1>;
}

export default ImageDetail;
