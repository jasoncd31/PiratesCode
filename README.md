<img src=./docs/images/piratescodelogo.jpg width="500" height="500">

# [PiratesCode](https://jasoncd31.github.io/PiratesCode/)

Ahoy mateys! Real pirates no longer surf the seven seas, they surf the world wide web! Inspired by the swashbuckling buccaneers of legend, PiratesCode be designed to make programming easy and fun for scurvy new programming recruits. PiratesCode be a language for those fixing to get an education and have fun while doing it! Since we’re all swashbuckling corsairs here, PiratesCode specifically helps ye write secure code so ye can protect your loot. All hop on the Flyin’ Dutchman and set your sails for the sea (of code) with PiratesCode!

### Written by [Maya Epps](https://github.com/mayaepps), [Jennifer Siao](https://github.com/jennifer-s19), [Jason Douglas](https://github.com/jasoncd31), [Tanya Nobal](https://github.com/tnobal), and [Saad Salman](https://github.com/thesaadsalman)

### Swashbuckling Features:

-   Mix of Python & Javascript: No parenthesis in if/while/for statements, but does have brackets
-   Pirate-themed language and syntax
-   Static typing
-   Object oriented
-   Built-in data structures
-   Extremely rude, but detailed error messages
-   Everything is natively private (protect your booty!)
-   Objects are natively passed by copy for security
-   vargh (equivalent to Java's var) can be used for type inference
-   String interpolation

### Scurvy Types

<table>
  <tr>
    <th>Javascript Type</th>
    <th>Scurvy Types</th>
  </tr>
  <tr>
    <td>boolean (true/false)</td>
    <td>booty (aye/nay)</td>
  </tr>
  <tr>
    <td>string</td>
    <td>shanty</td>
  </tr>
  <tr>
    <td>Number</td>
    <td>int</td>
  </tr>
  <tr>
    <td>Number</td>
    <td>doubloon</td>
  </tr>
  <tr>
    <td>object</td>
    <td>loot</td>
  </tr>
</table>

### Data Skeletons

<table>
  <tr>
    <th>Data Structure</th>
    <th>Data Skeleton</th>
  </tr>
  <tr>
    <td>Array/List</td>
    <td>ledger</td>
  </tr>
  <tr>
    <td>Dictionary</td>
    <td>map</td>
  </tr>
</table>

## Pirate Voyages

### Hello World

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>

```javascript
console.log(“Hello world!”)
```

</td>

<td>

```
ahoy “Hello world!”
```

</td>
</table>

### Variable Assignment

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>

```javascript
var x = 5
```

</td>

<td>

```
vargh x = 5
int x = 5
```

</td>
</table>

### Function Declarations

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```javascript
function evenOrOdd(x){
    return x %  2 ==  0
}
```
</td>
<td>
    
```
captain evenOrOdd(int x) -> booty {
    anchor x % 2 == 0
}
```
</td>
</table>

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```javascript
function add(a, b){
    return a + b;
}
```
</td>
<td>
    
```
captain add(int a, int b) -> int { 
   anchor a + b
}
```
</td>
</table>

### if-statements

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```javascript
if (x < 10) {
  return 1;
} else if (x < 20) {
  return -1;
} else {
  return 0;
}
```
</td>
<td>
    
```
yo x < 10 {
  anchor 1
} yo ho (x < 20) {
  anchor -1
} ho {
  anchor 0
} 
```
</td>
</table>

### Loops

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```javascript
while(true){
    break
}
```
</td>
<td>
    
```
parrot aye {
    maroon
}
```
</td>
</table>

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```javascript
for (var x = 0; x < 10; x++) {
    break
}
```
</td>
<td>
    
```
chase vargh x = 0 until 10 {
    maroon
}
```
</td>
</table>

<table>
<tr> <th>Python</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```python
for i in array:
    break
```
</td>
<td>
    
```
chase vargh x through locations {
     maroon
}
```
</td>
</table>

### Classes

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```javascript
class Rectangle {
    constructor(height, width){ 
        this.height = height;
        this.width = width;
    }
    getWidth() {
        return this.width
    }
    setWidth(newWidth) {
        this.width = newWidth
    }
}
let p = new Rectangle(3.0, 4);
console.log(p.getWidth())
p.setWidth(15)
```
</td>
<td>
    
```
ship Rectangle {
    build (doubloon h, int w) {
        doubloon me.height = h
        int me.width = w
    }
    captain getWidth() -> int {
        anchor me.width
    }
    captain setWidth(int newWidth) -> none {
        me.width = newWidth
    }
}
Rectangle p = new Rectangle(3.0, 4)
ahoy p.getWidth()
p.setWidth(15)
```
</td>
</table>

### Data Skeletons Assignment

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```javascript
let fruits = ['Apple', 'Banana']
```
</td>
<td>
    
```
vargh fruits = ['Apple', 'Banana']
```
</td>
</table>

<table>
<tr> <th>Python</th><th>PiratesCode</th><tr>
</tr>
<td>
    
```python
fruit_prices = dict()
products = []
```
</td>
<td>
    
```
{shanty, int} fruit prices = {}
[shanty] products = []
```
</td>
</table>

### Comments

<table>
<tr> <th>JavaScript</th><th>PiratesCode</th><tr>
</tr>
<td> 
    
```javascript
// comment goes here
```
</td>
<td>
    
```
$$ comment goes here
```
</td>
</table>

### Types of Semantic Errors

-   Use of non-initialized variables and objects
-   Using vargh for empty arrays and maps whose types cannot be inferred
-   Incompatible type comparison
-   Incorrect number of function parameters
-   Incorrect element types in maps and arrays
-   Break outside of loops
-   Return outside of a function
-   None return has a return value
-   Function with return value doesn't return anything
-   Calling a function or method that is not intialized
-   Reassigning a variable with the wrong type
-   Incrementing and decrementing with non-int variable types
-   Non-boolean value in conditional
-   For-Each loop without an iterable object passed
-   For loop with something other than integer value assigned to iterator
-   Different types in ternary conditional return
-   Declaring a variable with the wrong type
-   Declaring an object with the incorrect number of parameters
