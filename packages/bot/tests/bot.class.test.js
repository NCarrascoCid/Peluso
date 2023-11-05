const { test } = require('uvu')
const assert = require('uvu/assert')
const FlowClass = require('../io/flow.class')
const MockProvider = require('../../../__mocks__/mock.provider')
const { createBot, CoreClass, createFlow, createProvider, ProviderClass, addKeyword } = require('../index')

class MockFlow {
    allCallbacks = { ref: () => 1 }
    flowSerialize = []
    flowRaw = []
    find = (arg) => {
        if (arg) {
            return [{ answer: 'answer', ref: 'ref' }]
        } else {
            return null
        }
    }
    findBySerialize = () => ({})
    findIndexByRef = () => 0
    getRefToContinueChild = () => ({})
    getFlowsChild = () => []
}

class MockDBA {
    listHistory = []
    save = () => {}
    getPrevByNumber = () => {}
}

class MockDBB {
    listHistory = []
    save = () => {}
    getPrevByNumber = () => ({
        refSerialize: 'xxxxx',
        ref: 'xxxx',
        options: { callback: true },
    })
}

class MockDBC {
    listHistory = []
    save = () => {}
    getPrevByNumber = () => ({
        refSerialize: 'xxxxx',
        ref: 'xxxx',
        options: { callback: true, nested: ['1', '2'] },
    })
    saveLog = () => {}
}

test(`[CoreClass] Probando instanciamiento de clase`, async () => {
    const setting = {
        flow: new MockFlow(),
        database: new MockDBA(),
        provider: new MockProvider(),
    }
    const bot = await createBot(setting)
    assert.is(bot instanceof CoreClass, true)
})

test(`[CoreClass createFlow] Probando instanciamiento de clase`, async () => {
    const mockCreateFlow = createFlow([])
    assert.is(mockCreateFlow instanceof FlowClass, true)
})

test(`[CoreClass createProvider] Probando instanciamiento de clase`, async () => {
    const mockCreateProvider = createProvider(MockProvider)
    assert.is(mockCreateProvider instanceof ProviderClass, true)
})

test(`[Bot] Eventos 'require_action,ready,auth_failure,message '`, async () => {
    let responseEvents = {}

    const MOCK_EVENTS = {
        require_action: {
            instructions: 'Debes...',
        },
        ready: true,
        auth_failure: {
            instructions: 'Error...',
        },
        message: {
            from: 'XXXXXX',
            body: 'hola',
            hasMedia: false,
        },
    }

    const mockProvider = new MockProvider()

    const setting = {
        flow: new MockFlow(),
        database: new MockDBA(),
        provider: mockProvider,
    }
    await createBot(setting)

    /// Escuchamos eventos
    mockProvider.on('require_action', (r) => (responseEvents['require_action'] = r))
    mockProvider.on('ready', (r) => (responseEvents['ready'] = r))
    mockProvider.on('auth_failure', (r) => (responseEvents['auth_failure'] = r))
    mockProvider.on('message', (r) => (responseEvents['message'] = r))

    /// Emitimos eventos
    mockProvider.delaySendMessage(0, 'require_action', MOCK_EVENTS.require_action)
    mockProvider.delaySendMessage(0, 'ready', MOCK_EVENTS.ready)
    mockProvider.delaySendMessage(0, 'auth_failure', MOCK_EVENTS.auth_failure)
    mockProvider.delaySendMessage(0, 'message', MOCK_EVENTS.message)

    await delay(0)

    /// Testeamos eventos
    assert.is(JSON.stringify(responseEvents.require_action), JSON.stringify(MOCK_EVENTS.require_action))
    assert.is(responseEvents.ready, MOCK_EVENTS.ready)

    assert.is(JSON.stringify(responseEvents.auth_failure), JSON.stringify(MOCK_EVENTS.auth_failure))

    assert.is(JSON.stringify(responseEvents.message), JSON.stringify(MOCK_EVENTS.message))
})

test(`[Bot] Probando Flujos Internos`, async () => {
    let responseEvents = {}

    const MOCK_EVENTS = {
        require_action: {
            instructions: 'Debes...',
        },
        ready: true,
        auth_failure: {
            instructions: 'Error...',
        },
        message: {
            from: 'XXXXXX',
            body: 'hola',
            hasMedia: false,
        },
    }

    const mockProvider = new MockProvider()

    const setting = {
        flow: new MockFlow(),
        database: new MockDBB(),
        provider: mockProvider,
    }
    await createBot(setting)

    /// Escuchamos eventos
    mockProvider.on('require_action', (r) => (responseEvents['require_action'] = r))
    mockProvider.on('ready', (r) => (responseEvents['ready'] = r))
    mockProvider.on('auth_failure', (r) => (responseEvents['auth_failure'] = r))
    mockProvider.on('message', (r) => (responseEvents['message'] = r))

    /// Emitimos eventos
    mockProvider.delaySendMessage(0, 'require_action', MOCK_EVENTS.require_action)
    mockProvider.delaySendMessage(0, 'ready', MOCK_EVENTS.ready)
    mockProvider.delaySendMessage(0, 'auth_failure', MOCK_EVENTS.auth_failure)
    mockProvider.delaySendMessage(0, 'message', MOCK_EVENTS.message)

    await delay(0)

    /// Testeamos eventos
    assert.is(JSON.stringify(responseEvents.require_action), JSON.stringify(MOCK_EVENTS.require_action))
    assert.is(responseEvents.ready, MOCK_EVENTS.ready)

    assert.is(JSON.stringify(responseEvents.auth_failure), JSON.stringify(MOCK_EVENTS.auth_failure))

    assert.is(JSON.stringify(responseEvents.message), JSON.stringify(MOCK_EVENTS.message))
})

test(`[Bot] Probando Flujos Nested`, async () => {
    let responseEvents = {}

    const MOCK_EVENTS = {
        require_action: {
            instructions: 'Debes...',
        },
        ready: true,
        auth_failure: {
            instructions: 'Error...',
        },
        message: {
            from: 'XXXXXX',
            body: 'hola',
            hasMedia: false,
        },
    }

    const mockProvider = new MockProvider()

    const setting = {
        flow: new MockFlow(),
        database: new MockDBC(),
        provider: mockProvider,
    }
    const botInstance = await createBot(setting)

    botInstance.sendProviderAndSave('xxxxx', 'xxxxx')
    botInstance.continue('xxxxx', 'xxxxx')
    /// Escuchamos eventos
    mockProvider.on('require_action', (r) => (responseEvents['require_action'] = r))
    mockProvider.on('ready', (r) => (responseEvents['ready'] = r))
    mockProvider.on('auth_failure', (r) => (responseEvents['auth_failure'] = r))
    mockProvider.on('message', (r) => (responseEvents['message'] = r))

    /// Emitimos eventos
    mockProvider.delaySendMessage(0, 'require_action', MOCK_EVENTS.require_action)
    mockProvider.delaySendMessage(0, 'ready', MOCK_EVENTS.ready)
    mockProvider.delaySendMessage(0, 'auth_failure', MOCK_EVENTS.auth_failure)
    mockProvider.delaySendMessage(0, 'message', MOCK_EVENTS.message)

    await delay(0)

    /// Testeamos eventos
    assert.is(JSON.stringify(responseEvents.require_action), JSON.stringify(MOCK_EVENTS.require_action))
    assert.is(responseEvents.ready, MOCK_EVENTS.ready)

    assert.is(JSON.stringify(responseEvents.auth_failure), JSON.stringify(MOCK_EVENTS.auth_failure))

    assert.is(JSON.stringify(responseEvents.message), JSON.stringify(MOCK_EVENTS.message))
})

test(`[Bot] Probando createCtxMessage `, async () => {
    const mockProvider = new MockProvider()

    const setting = {
        flow: new MockFlow(),
        database: new MockDBB(),
        provider: mockProvider,
    }

    const bot = await createBot(setting)

    const messageCtxInComming = {
        body: 'Hola',
        from: '123456789',
    }

    const botHandler = await bot.handleMsg(messageCtxInComming)
    const result = botHandler.createCtxMessage(`Hola`)

    assert.is(result.answer, 'Hola')
    assert.is(result.options.media, null)
    assert.is(result.options.buttons.length, 0)
    assert.is(result.options.capture, false)
    assert.is(result.options.delay, 0)
    assert.is(result.from, '123456789')
})

test(`[Bot] Probando clearQueue `, async () => {
    const mockProvider = new MockProvider()

    const setting = {
        flow: new MockFlow(),
        database: new MockDBB(),
        provider: mockProvider,
    }

    const bot = await createBot(setting)

    const messageCtxInComming = {
        body: 'Hola',
        from: '123456789',
    }

    const botHandler = await bot.handleMsg(messageCtxInComming)
    const result = botHandler.clearQueue()

    assert.is(result, undefined)
})

test(`[Bot] Probando endFlow `, async () => {
    const mockProvider = new MockProvider()

    const setting = {
        flow: new MockFlow(),
        database: new MockDBB(),
        provider: mockProvider,
    }

    const bot = await createBot(setting)

    const messageCtxInComming = {
        body: 'Hola',
        from: '123456789',
    }

    const botHandler = await bot.handleMsg(messageCtxInComming)
    const result = botHandler.endFlow({ endFlow: false })('hola')

    assert.is(Object.values(result).length, 0)
})

test(`[Bot] Probando sendFlow  `, async () => {
    const mockProvider = new MockProvider()

    const setting = {
        flow: new MockFlow(),
        database: new MockDBB(),
        provider: mockProvider,
    }

    const bot = await createBot(setting)

    const messageCtxInComming = {
        body: 'Hola',
        from: '123456789',
    }

    const botHandler = await bot.handleMsg(messageCtxInComming)
    const messages = [
        {
            body: 'Hola',
            from: '123456789',
        },
    ]
    const resultA = await botHandler.sendFlow(messages, '00000', {})
    const resultB = await botHandler.sendFlow(messages, '00000', {
        prev: {
            options: {
                capture: true,
            },
        },
    })
    const resultC = await botHandler.sendFlow(messages, '00000', { forceQueue: true })
    assert.is(undefined, resultA)
    assert.is(undefined, resultB)
    assert.is(undefined, resultC)
})

test(`[Bot] Probando fallBack  `, async () => {
    const mockProvider = new MockProvider()

    const setting = {
        flow: new MockFlow(),
        database: new MockDBB(),
        provider: mockProvider,
    }

    const bot = await createBot(setting)

    const messageCtxInComming = {
        body: 'Hola',
        from: '123456789',
    }

    const botHandler = await bot.handleMsg(messageCtxInComming)
    const result = botHandler.fallBack({ fallBack: true })('hola')

    assert.is(Object.values(result).length, 0)
})

test(`[Bot] Probando gotoFlow  `, async () => {
    const mockProvider = new MockProvider()
    const flowWelcome = addKeyword('hola').addAnswer('chao')
    const flow = createFlow([flowWelcome])
    const setting = {
        flow,
        database: new MockDBB(),
        provider: mockProvider,
    }

    const bot = await createBot(setting)

    const messageCtxInComming = {
        body: 'Hola',
        from: '123456789',
    }

    const botHandler = await bot.handleMsg(messageCtxInComming)
    const result = botHandler.gotoFlow({ gotoFlow: true })(flowWelcome)

    assert.is(Object.values(result).length, 0)
})

test(`[Bot] Probando flowDynamic  `, async () => {
    const mockProvider = new MockProvider()
    const flowWelcome = addKeyword('hola').addAnswer('chao')
    const flow = createFlow([flowWelcome])
    const setting = {
        flow,
        database: new MockDBB(),
        provider: mockProvider,
    }

    const bot = await createBot(setting)

    const messageCtxInComming = {
        body: 'Hola',
        from: '123456789',
    }

    const botHandler = await bot.handleMsg(messageCtxInComming)
    const result = botHandler.flowDynamic([
        {
            body: 'Message',
        },
    ])(flowWelcome)

    assert.is(Object.values(result).length, 0)
})

test.run()

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms))
}
