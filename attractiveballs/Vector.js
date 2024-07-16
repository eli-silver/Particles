/**
 * Represents a 2D vector.
 */
class Vector {
    /**
     * Creates a new Vector.
     * @param {number} x - The x component of the vector.
     * @param {number} y - The y component of the vector.
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
    /**
     * Sets the components of the vector.
     * @param {number} x - The new x component.
     * @param {number} y - The new y component.
     * @returns {Vector} The vector instance for chaining.
     */
    set(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }
  
    /**
     * Creates a new Vector with the same components.
     * @returns {Vector} A new Vector instance.
     */
    get() {
      return new Vector(this.x, this.y);
    }
  
    /**
     * Adds another vector to this vector.
     * @param {Vector} v - The vector to add.
     * @returns {Vector} A new Vector representing the sum.
     */
    add(v) {
      return new Vector(this.x + v.x, this.y + v.y);
    }
  
    /**
     * Subtracts another vector from this vector.
     * @param {Vector} v - The vector to subtract.
     * @returns {Vector} A new Vector representing the difference.
     */
    subtract(v) {
      return new Vector(this.x - v.x, this.y - v.y);
    }

    /**
     * Multiplies the current vector by a scalar.
     * @param {number} a - the scalar quantity to multiply vector componnents by.
     * @returns {Vector} A new vector that is the scaled version of itself.
     */
    multiply(a){
        return new Vector(this.x * a, this.y * a);
    }
  
    /**
     * Calculates the dot product of this vector with another vector.
     * @param {Vector} v - The vector to dot with.
     * @returns {number} The dot product.
     */
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }
  
    /**
     * Calculates the cross product of this vector with another vector.
     * Note: For 2D vectors such as in this case, this returns a scalar representing the magnitude.
     * @param {Vector} v - The vector to cross with.
     * @returns {number} The cross product.
     */
    cross(v) {
      return this.x * v.y - this.y * v.x;
    }
  
    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number} The magnitude of the vector.
     */
    magnitude() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Creates a new vector with the same direction and magnitude (length) 1
     * @returns {Vector}
     */
    normalize(){
        const magnitude = this.magnitude();
        return new Vector(this.x/magnitude, this.y/magnitude);
    }
  
    /**
     * Returns a string representation of the vector.
     * @returns {string} The string representation of the vector.
     */
    toString() {
      return `(${this.x}, ${this.y})`;
    }
  }