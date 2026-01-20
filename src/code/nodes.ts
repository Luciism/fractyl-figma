// type ParentNode =
//   | FrameNode
//   | GroupNode
//   | InstanceNode
//   | ComponentNode
//   | ComponentSetNode
//   | SectionNode;

export function isParentNode(node: SceneNode) {
  return (
    node.type === "FRAME" ||
    node.type === "GROUP" ||
    node.type === "INSTANCE" ||
    node.type == "COMPONENT" ||
    node.type === "COMPONENT_SET" ||
    node.type === "SECTION"
  );
}

export function isStyleableNode(node: SceneNode) {
  return (
    node.type === "RECTANGLE" ||
    node.type === "TEXT" ||
    node.type === "TEXT_PATH" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT" ||
    node.type === "COMPONENT_SET" ||
    node.type === "FRAME" ||
    node.type === "VECTOR" ||
    node.type === "STAR" ||
    node.type === "ELLIPSE" ||
    node.type === "POLYGON" ||
    node.type === "BOOLEAN_OPERATION" ||
    node.type === "WASHI_TAPE" ||
    node.type === "SLIDE" ||
    node.type === "HIGHLIGHT" 
  );
}

export function isFillableNode(node: SceneNode) {
  return (
    isStyleableNode(node) ||
    node.type === "TABLE" ||
    node.type === "SHAPE_WITH_TEXT" ||
    node.type === "STICKY" 
  ) 
}

export function isShapeNode(node: SceneNode) {
  return (
    node.type === "RECTANGLE" ||
    node.type === "ELLIPSE" ||
    node.type === "POLYGON" ||
    node.type === "STAR" 
  ) 
}
