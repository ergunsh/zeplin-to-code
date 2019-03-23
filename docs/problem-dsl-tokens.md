## Tokens:
* ".block", – for `display: block`
* ".inline", for `display: inline`
* ".inline-block", for `display: inline-block`
* ".flex", – for `display: flex`
* ".row", – for `flex-direction: row`
* ".column", – for `flex-direction: column`
* ".wrap", – for `flex-wrap: wrap`
* ".nowrap", – for `flex-wrap: nowrap`
* ".j-flex-start", - for `justify-content: flex-start`
* ".j-flex-end", - for `justify-content: flex-end`
* ".j-center", - for `justify-content: center`
* ".j-space-between", - for `justify-content: space-between`
* ".j-space-around", - for `justify-content: space-around`
* ".j-space-evenly", - for `justify-content: space-evenly`
* ".ai-flex-start", – for `align-items: flex-start`
* ".ai-flex-end", – for `align-items: flex-end`
* ".ai-center", – for `align-items: center`
* ".ai-stretch", – for `align-items: stretch`
* ".ai-baseline", – for `align-items: baseline`
* "{", – to describe a parent - child relationship
* "}",
* "|", – to describe siblings

## Examples
Input: {.flex.row{block|block|block|block|block}}
Output in React Native:
```jsx
<View style={{
    display: "flex",
    flexDirection: "row"
}}>
    <View/>
    <View/>
    <View/>
    <View/>
    <View/>
</View>
```