import { moduleBuilderFactory } from "../moduleBuilderFactory"
import { mapState, Store } from "vuex"

const mockGenerateAction = jest.fn()
const mockToActionTree = jest.fn()
jest.mock("../actionBuilderFactory", () => {
    return {
        actionBuilderFactory: jest.fn(() => ({
            generate: mockGenerateAction,
            toActionTree: mockToActionTree,
        })),
    }
})

const mockGenerateMutation = jest.fn()
const mockToMutationTree = jest.fn()
jest.mock("../mutationBuilderFactory", () => {
    return {
        mutationBuilderFactory: jest.fn(() => ({
            generate: mockGenerateMutation,
            toMutationTree: mockToMutationTree,
        })),
    }
})

jest.mock("vuex")
const mockMapState = mapState as jest.Mock

describe("moduleBuilderFactory", () => {
    describe("actions", () => {
        it("should pipe to actionFactory.generate when calling addAction", () => {
            // given
            const factory = moduleBuilderFactory()
            const type = "sometype"
            const handler = () => {}

            // when
            factory.addAction(type, handler)

            // then
            expect(mockGenerateAction).toBeCalledWith(type, handler)
            expect(mockGenerateAction).toBeCalledTimes(1)
        })

        it("should use actionFactory.toActionTree in module", () => {
            // given
            const factory = moduleBuilderFactory<string>()
            const actionTree = { foo: "bar" }
            mockToActionTree.mockReturnValueOnce(actionTree)

            // when
            const module = factory.getModule("initial")

            // then
            expect(module.actions).toEqual(actionTree)
        })
    })

    describe("mutations", () => {
        it("should pipe to mutationFactory.generate when calling addMutation", () => {
            // given
            const factory = moduleBuilderFactory()
            const type = "sometype"
            const handler = () => {}

            // when
            factory.addMutation(type, handler)

            // then
            expect(mockGenerateMutation).toBeCalledWith(type, handler)
            expect(mockGenerateMutation).toBeCalledTimes(1)
        })

        it("should use mutationFactory.toMutationTree in module", () => {
            // given
            const factory = moduleBuilderFactory<string>()
            const mutationTree = { foo: "bar" }
            mockToMutationTree.mockReturnValueOnce(mutationTree)

            // when
            const module = factory.getModule("initial")

            // then
            expect(module.mutations).toEqual(mutationTree)
        })
    })

    describe("module", () => {
        it("should return a namespace without explicit namespacebuilder", () => {
            // given
            const givenNamespace = "foo/bar/baz"
            const factory = moduleBuilderFactory<unknown, unknown, string>()

            // when
            const namespace = factory.namespace(givenNamespace)

            // then
            expect(namespace).toEqual(givenNamespace)
        })

        it("should have namespaced=true when getModule is called", () => {
            // given
            const factory = moduleBuilderFactory<string>()

            // when
            const module = factory.getModule("")

            // then
            expect(module.namespaced).toEqual(true)
        })

        it("should have provided initialstate when getModule is called", () => {
            // given
            const initialState = "amazing"
            const factory = moduleBuilderFactory<string>()

            // when
            const module = factory.getModule(initialState)

            // then
            expect(module.state).toEqual(initialState)
        })
    })

    describe("with store", () => {
        let store: Store<string>
        const mockHasModule = jest.fn()
        const mockRegister = jest.fn()
        const mockUnregister = jest.fn()

        beforeEach(() => {
            store = {
                hasModule: mockHasModule,
                registerModule: mockRegister,
                unregisterModule: mockUnregister,
            } as unknown as Store<string>
        })

        it("should register with path=namespaceArgs when no namespaceBuilder is given", () => {
            // given
            const factory = moduleBuilderFactory<unknown, unknown, string>()
            const namespaceArgs = "foobarbaz"

            // when
            factory.register(store, { namespaceArgs, initialState: "" })

            // then
            expect(mockRegister).toBeCalledWith(namespaceArgs, expect.anything())
        })

        it("should register under path formed by namespaceBuilder", () => {
            // given
            const namespaceBuilder = (id: string) => "testing/" + id
            const factory = moduleBuilderFactory<unknown, unknown, string>({
                namespaceBuilder,
            })
            const namespaceArgs = "foobarbaz"

            // when
            factory.register(store, { namespaceArgs, initialState: "" })

            // then
            expect(mockRegister).toBeCalledWith(namespaceBuilder(namespaceArgs), expect.anything())
        })

        it("should register under options.namespace when no namespaceArgs are given", () => {
            // given
            const namespace = "foobarbaz"
            const factory = moduleBuilderFactory({ namespace })

            // when
            factory.register(store, { initialState: "" })

            // then
            expect(mockRegister).toBeCalledWith(namespace, expect.anything())
        })

        it("should register with new module instance and given initialstate", () => {
            // given
            const factory = moduleBuilderFactory<unknown, {}, string>()
            const initialState = "some amazing state"

            // when
            factory.register(store, { namespaceArgs: "", initialState })

            // then
            expect(mockRegister).toBeCalledWith(
                expect.anything(),
                expect.objectContaining({
                    state: initialState,
                })
            )
        })

        it("should pipe to store.hasModule when calling factory.hasModule without namespacebuilder", () => {
            // given
            const factory = moduleBuilderFactory<unknown, unknown, string>()
            const namespaceArgs = "foo"

            // when
            factory.hasModule(store, namespaceArgs)

            // then
            expect(mockHasModule).toBeCalledWith(namespaceArgs)
            expect(mockHasModule).toBeCalledTimes(1)
        })

        it("should pipe to store.hasModule when calling factory.hasModule without namespacebuilder", () => {
            // given
            const namespaceBuilder = (args: string) => "foo/" + args
            const factory = moduleBuilderFactory<unknown, unknown, string>({
                namespaceBuilder,
            })
            const namespaceArgs = "bar"

            // when
            factory.hasModule(store, namespaceArgs)

            // then
            expect(mockHasModule).toBeCalledWith(namespaceBuilder(namespaceArgs))
            expect(mockHasModule).toBeCalledTimes(1)
        })

        it("should use option.namespace when calling store.hasModule", () => {
            // given
            const namespace = "foobarbaz"
            const factory = moduleBuilderFactory({ namespace })

            // when
            factory.hasModule(store)

            // then
            expect(mockHasModule).toBeCalledWith(namespace)
        })

        describe("getNamespace", () => {
            it("should return options.namespace when getNamespace is called when no namespaceBuilder is given", () => {
                // given
                const namespace = "thenamespace"

                // when
                const factory = moduleBuilderFactory({ namespace })

                // then
                expect(factory.namespace).toEqual(namespace)
            })

            it("should return options.namespaceBuilder when getNamespace is called", () => {
                // given
                const nsArgs = "foobarbaz"
                const namespace = "thenamespace"
                const namespaceBuilder = jest.fn(() => namespace)
                const factory = moduleBuilderFactory<unknown, unknown, string>({ namespaceBuilder })

                // when
                const returnedNamespace = factory.namespace(nsArgs)

                // then
                expect(returnedNamespace).toEqual(namespace)
                expect(namespaceBuilder).toBeCalledWith(nsArgs)
            })
        })

        describe("continueOnDuplicate", () => {
            // continueOnDuplicate = false, registerModule throwing
            it("should reject when continueOnDuplicate=falsy and store already has the module", () => {
                // given
                const factory = moduleBuilderFactory<unknown, unknown, string>()
                const errorMessage = "grave error"
                mockRegister.mockRejectedValueOnce(errorMessage)

                // when
                const rejectingFn = factory.register(store, { initialState: "", namespaceArgs: "" })

                // then
                expect(mockHasModule).not.toBeCalled()
                return expect(rejectingFn).rejects.toEqual(errorMessage)
            })

            // continueOnDuplicate = false, registerModule throwing
            it("should throw when continueOnDuplicate=falsy and store already has the module", () => {
                // given
                const factory = moduleBuilderFactory<unknown, unknown, string>()
                const errorMessage = "grave error"
                mockRegister.mockImplementationOnce(() => {
                    throw new Error(errorMessage)
                })

                // when
                const throwingFn = factory.register(store, { initialState: "", namespaceArgs: "" })

                // then
                expect(mockHasModule).not.toBeCalled()
                return expect(throwingFn).rejects.toThrowError(errorMessage)
            })

            // continueOnDuplicate = false, registerModule not throwing
            it("should return true when register module runs through with continueOnDuplicate=falsy", async () => {
                // given
                const factory = moduleBuilderFactory<unknown, unknown, string>()

                // when
                const registerReturn = await factory.register(store, { initialState: "", namespaceArgs: "" })

                // then
                expect(registerReturn).toBeTruthy()
            })

            // continueOnDuplicate = true, hasModule returns false
            it("should return true when store.hasModule=false and continueOnDuplicate=falsy", async () => {
                // given
                const factory = moduleBuilderFactory<unknown, unknown, string>()
                mockHasModule.mockReturnValueOnce(false)

                // when
                const registerReturn = await factory.register(store, {
                    continueOnDuplicate: true,
                    initialState: "",
                    namespaceArgs: "",
                })

                // then
                expect(registerReturn).toBeTruthy()
                expect(mockHasModule).toBeCalledTimes(1)
            })

            // continueOnDuplicate = true, hasModule returns true
            it("should return false when store.hasModule=false and continueOnDuplicate=falsy", async () => {
                // given
                const factory = moduleBuilderFactory<unknown, unknown, string>()
                mockHasModule.mockReturnValueOnce(true)

                // when
                const registerReturn = await factory.register(store, {
                    continueOnDuplicate: true,
                    initialState: "",
                    namespaceArgs: "",
                })

                // then
                expect(registerReturn).toBeFalsy()
                expect(mockHasModule).toBeCalledTimes(1)
            })
        })
    })

    describe("mapState", () => {
        type ModuleState = {
            foo: string
            bar: number
            baz: Array<string | number>
        }

        it("should pipe to vuex.mapState with fixed namespace", () => {
            // given
            const namespace = "thenamespace"
            const expr = ["foo" as keyof ModuleState]
            const factory = moduleBuilderFactory<ModuleState>({ namespace })

            // when
            factory.mapState(expr)

            // then
            expect(mockMapState).toBeCalledWith(factory.namespace, expr)
            expect(mockMapState).toBeCalledTimes(1)
        })

        it("should pipe to vuex.mapState with dynamic namespace", () => {
            // given
            const namespaceArgs = "foo"
            const namespaceBuilder = (args: string) => `${args}/bar/baz`
            const expr = ["foo" as keyof ModuleState]
            const factory = moduleBuilderFactory<ModuleState, unknown, string>({ namespaceBuilder })

            // when
            factory.mapState(namespaceArgs, expr)

            // then
            expect(mockMapState).toBeCalledWith(factory.namespace(namespaceArgs), expr)
            expect(mockMapState).toBeCalledTimes(1)
        })
    })
})
