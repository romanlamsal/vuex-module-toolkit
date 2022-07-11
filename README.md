# vuex-module-toolkit
A toolkit to create typesafe modules, getters, mutations and actions

## Mutations

TBD (but pretty much the same as actions below)

## Actions

### Creating

Either via factory:

```ts
const actionFactory = actionBuilderFactory<ModuleState, RootState>()

const increaseAction = actionFactory.generate<{ amount: number }, number>("increase", (
    actionContext /* ActionContext<ModuleState, RootState> */, 
    event /* { amount: number } */
) => {
    /* ... */
})
```

Or with a simple builder:

```ts
const increaseAction = actionBuilder<{ amount: number }, ModuleState, RootState, number>("increase", (
    actionContext /* ActionContext<ModuleState, RootState> */, 
    event /* { amount: number } */
) => {
    /* ... */
})
```

#### Factory vs Builder

If you plan to create multiple actions for one module it is advised to use a factory over a builder. 
Every time `actionFactory.generate` is called the generated action is returned and also cached in the factory itself.

By calling `actionFactory.toActionTree()` an action tree is returned which can be used in every vuex store/module.

### Dispatch without namespace

There are multiple ways to use your actions after creation. 
Given the above creation (factory and builder return the functionally same):

```ts
// via typed function call into a store.dispatch
store.dispatch(increaseAction({ amount: 42 }))

// via action.dispatch with the store as first argument
increaseAction.dispatch(store, { amount: 42 })
```


### Dispatch with namespace prefix

If you need to dispatch your actions into a specific namespace (**without the type**) you can also dispatch the actions
directly to namespaces. All the examples below are equivalents to `store.dispatch("foo/bar/increase", { amount: 42 })`:

```ts
// forcing to a specific namespace via typed function call into a store.dispatch
store.dispatch(increaseAction({ amount: 42 }, { namespace: "foo/bar" }))

// by making use of the default namespaceBuilder and a custom helper `namespaced()`
// note that this call uses the namespaceBuilder provided on action creation
store.dispatch(increaseAction.namespaced("foo/bar", { amount: 42 }))

// via action.dispatchNamepsaced
// store as arguments and namespace builder arguments (see below) as arguments
// note that this call uses the namespaceBuilder provided on action creation
increaseAction.dispatchNamespaced(store, "foo/bar", { amount: 42 })
```

## Non-reusable Modules
Readme is TBD. Use `moduleBuilderFactory` without `namespaceBuilder` (see below) and constructor args. 
Then create and export something like:

```ts
type ModuleState = { value: number }

const myModuleBuilder = moduleBuilderFactory<ModuleState, RootState>({
    state: () => ({ value: 0 }) // return type is the generic ModuleState
})

// calls an actionBuilderFactory internally and has the same signature as actionBuilderFactory.generate
myModule.addAction(/* ... */)

// calls a mutationBuilderFactory internally and has the same signature as mutationBuilderFactory.generate
myModule.addMutation(/* ... */)

// calling getModule() will automatically use all actions and mutations defined via addAction and addMutation
export const myModule = myModuleBuilder.getModule()
```

## Reusable Modules
Readme is TBD. Use `moduleBuilderFactory` and define a `namespaceBuilder` (see below). 
Also make good use of the constructorArgs type.

```ts
type ModuleState = { value: number }
type ConstructorArgs = { initialValue: number }
type NamespaceArgs = { entityId: string }

export const myModuleBuilderFactory = moduleBuilderFactory<ModuleState, RootState, ConstructorArgs, NamespaceArgs>({
    state: (constructorArgs /* ConstructorArgs */) => ({ value: constructorArgs.initialValue }),
    namespaceBuilder: (nsArgs /* NamespaceArgs */) => "foo/" + nsArgs.entityId
})

// calls an actionBuilderFactory internally and has the same signature as actionBuilderFactory.generate
myModule.addAction(/* ... */)

// calls a mutationBuilderFactory internally and has the same signature as mutationBuilderFactory.generate
myModule.addMutation(/* ... */)
```

After creating and exporting a factory like so, you can dynamically register and unregister modules to your store 
using your moduleBuilderFactory - super type safe and with the help of the namespaceBuilder also reliably addressable
with `action.namespaced` et al.

```ts
// register an instance of the previously defined module to the store
myModuleBuilderFactory.register(store, constructorArgs /* ConstructorArgs */, nsArgs /* NamespaceArgs */)

// unregister under a given namespace - again making use of the namespaceBuilder
// we only need NamespaceArgs because the constructorArgs are only relevant to the initial state
myModuleBuilderFactory.unregister(store, nsArgs /* NamespaceArgs */)
```


## NamespaceBuilder

Upon creation of a factory or builder instance (i.e. `actionBuilder`, `actionBuilderFactory`, `mutationBuilder`, `mutationBuilderFactory`, )
you can provide an optional `namespaceBuilder`. The default is ```args => `${args}` ```.

The provided `namespaceBuilder` will be called with the arguments provided during
- `action.namespaced`
- `action.dispatchNamespaced`
- `mutation.namespaced`
- `mutation.dispatchNamespaced`
- `module.register`

Here are some examples:

### `store.dispatch("foo/bar/baz", 42)`

Equivalents:

With an actionBuilder:
```ts
// do note the third generic which is typing the namespaceBuilder arguments
const bazAction = actionBuilder<number, ModuleState, RootState, string>(
    "baz", 
    () => { /*...*/ }, { 
    namespaceBuilder: nsArgs => `foo/${nsArgs}`
})

// every argument is typed by actionBuilder's generics
store.dispatch(bazAction.namespaced("bar", 42))
// <=>
bazAction.dispatchNamespaced(store, "bar", 42)
```

With an actionBuilderFactory:

```ts
const actionFactory = actionBuilderFactory<ModuleState, RootState>({
    namespaceBuilder: nsArgs => `foo/${nsArgs}`
})

// the action receives the namespaceBuilder from the factory
// hence all actions created with this factory instance will share the same namespace builder and typings
const bazAction = actionFactory.generate<number>("baz", () => { /*...*/ })

store.dispatch(bazAction.namespaced("bar", 42))
// <=>
bazAction.dispatchNamespaced(store, "bar", 42)
```

## Calling typed Mutations and Actions from Actions

Due to the flexibility in namespacing we can combine mutations and actions within the same module without namespace
and call the actions and mutations outside the module with namespace (explained in the section above).

```ts
const increaseByMutation = mutationBuilder<number, ModuleState>("INCREASE_BY", (state, newValue) => { 
    state.value = newValue
})

const increaseByAction = actionBuilder<number, ModuleState, RootState, string>(
    "baz",
    ({ commit }, event) => { 
        const newValue = event.payload
        
        /* do something regarding your business logic, asynchronous calls, other dispatches, etc. */
        
        // call your mutation with typed arguments and no namespace
        // this is the typed equivalent to `commit("INCREASE_BY", newValue)`
        commit(increaseByMutation(newValue))
    }
)

```