import Object from "./object.js";

export default class ArticulatedObject {
  children = [];

  translation = [0, 0, 0];
  rotation = [0, 0, 0];
  scale = [1, 1, 1];

  constructor(gl, program, articulatedModel) {
    this.gl = gl;
    this.program = program;
    this.object = new Object(gl, program, articulatedModel.object);

    this.object.scale = articulatedModel.scale;
    this.object.setTexture(articulatedModel.texture);

    this.name = articulatedModel.id;
    this.translation = articulatedModel.coordinates;
    this.rotation = articulatedModel.rotation.map((x) => (x * Math.PI) / 180);
    this.scale = [1, 1, 1];

    for (let i = 0; i < articulatedModel.children.length; i++) {
      this.children.push(
        new ArticulatedObject(gl, program, articulatedModel.children[i])
      );
    }
  }

  draw(projection, view, model, cameraPosition, shadingMode) {
    let newModel = model.clone();
    newModel.transform(this.translation, this.rotation, this.scale);

    this.object.draw(projection, view, newModel, cameraPosition, shadingMode);

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw(
        projection,
        view,
        newModel,
        cameraPosition,
        shadingMode
      );
    }
  }

  generateHTML(depth, id) {
    let toReturn = "<div class='horizontal-box justify-start'>";
    for (let i = 0; i < depth; i++) {
      toReturn += "&nbsp;&nbsp;&nbsp;&nbsp;";
    }
    toReturn +=
      "<button id='Object-" + id + "'>" + this.name + "</button></div>";
    id++;
    for (let i = 0; i < this.children.length; i++) {
      toReturn += this.children[i].generateHTML(depth + 1, id);
      id += this.children[i].getTotalObj();
    }
    return toReturn;
  }

  getArticulatedObject(id) {
    if (id == 0) {
      return this;
    }
    id--;
    for (let i = 0; i < this.children.length; i++) {
      let returned = this.children[i].getArticulatedObject(id);
      id -= this.children[i].getTotalObj();
      if (returned != null) {
        return returned;
      }
    }
    return null;
  }

  getArticulatedObjectByName(name) {
    if (this.name == name) {
      return this;
    }
    for (let i = 0; i < this.children.length; i++) {
      let returned = this.children[i].getArticulatedObjectByName(name);
      if (returned != null) {
        return returned;
      }
    }
    return null;
  }

  getTotalObj() {
    let toReturn = 1;
    for (let i = 0; i < this.children.length; i++) {
      toReturn += this.children[i].getTotalObj();
    }
    return toReturn;
  }

  setTexture(toTexture) {
    this.object.setTexture(toTexture);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].setTexture(toTexture);
    }
  }
}
