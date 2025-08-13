/**
 * Simple Test Framework for PRD-Builder
 */

const TestRunner = (() => {
    let testSuites = [];
    let currentSuite = null;
    let stats = {
        total: 0,
        passed: 0,
        failed: 0,
        suites: []
    };
    
    /**
     * Register a test suite
     */
    function describe(suiteName, suiteFunction) {
        const suite = {
            name: suiteName,
            tests: [],
            beforeEach: null,
            afterEach: null,
            beforeAll: null,
            afterAll: null
        };
        
        currentSuite = suite;
        testSuites.push(suite);
        
        // Execute suite function to collect tests
        suiteFunction();
        currentSuite = null;
    }
    
    /**
     * Register a test
     */
    function it(testName, testFunction) {
        if (!currentSuite) {
            throw new Error('Test must be defined within a describe block');
        }
        
        currentSuite.tests.push({
            name: testName,
            fn: testFunction,
            result: null,
            error: null
        });
    }
    
    /**
     * Register beforeEach hook
     */
    function beforeEach(hookFunction) {
        if (!currentSuite) {
            throw new Error('beforeEach must be defined within a describe block');
        }
        currentSuite.beforeEach = hookFunction;
    }
    
    /**
     * Register afterEach hook
     */
    function afterEach(hookFunction) {
        if (!currentSuite) {
            throw new Error('afterEach must be defined within a describe block');
        }
        currentSuite.afterEach = hookFunction;
    }
    
    /**
     * Register beforeAll hook
     */
    function beforeAll(hookFunction) {
        if (!currentSuite) {
            throw new Error('beforeAll must be defined within a describe block');
        }
        currentSuite.beforeAll = hookFunction;
    }
    
    /**
     * Register afterAll hook
     */
    function afterAll(hookFunction) {
        if (!currentSuite) {
            throw new Error('afterAll must be defined within a describe block');
        }
        currentSuite.afterAll = hookFunction;
    }
    
    /**
     * Assertion library
     */
    const expect = (actual) => ({
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
            }
        },
        
        toEqual(expected) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
            }
        },
        
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
            }
        },
        
        toBeFalsy() {
            if (actual) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
            }
        },
        
        toContain(item) {
            if (Array.isArray(actual)) {
                if (!actual.includes(item)) {
                    throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
                }
            } else if (typeof actual === 'string') {
                if (!actual.includes(item)) {
                    throw new Error(`Expected string to contain "${item}"`);
                }
            } else {
                throw new Error('toContain can only be used with arrays or strings');
            }
        },
        
        toHaveLength(length) {
            if (!actual || actual.length === undefined) {
                throw new Error('toHaveLength can only be used with arrays or strings');
            }
            if (actual.length !== length) {
                throw new Error(`Expected length ${actual.length} to be ${length}`);
            }
        },
        
        toBeGreaterThan(value) {
            if (actual <= value) {
                throw new Error(`Expected ${actual} to be greater than ${value}`);
            }
        },
        
        toBeLessThan(value) {
            if (actual >= value) {
                throw new Error(`Expected ${actual} to be less than ${value}`);
            }
        },
        
        toThrow() {
            if (typeof actual !== 'function') {
                throw new Error('toThrow can only be used with functions');
            }
            let thrown = false;
            try {
                actual();
            } catch (e) {
                thrown = true;
            }
            if (!thrown) {
                throw new Error('Expected function to throw an error');
            }
        },
        
        toBeNull() {
            if (actual !== null) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be null`);
            }
        },
        
        toBeUndefined() {
            if (actual !== undefined) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be undefined`);
            }
        },
        
        toBeDefined() {
            if (actual === undefined) {
                throw new Error('Expected value to be defined');
            }
        }
    });
    
    /**
     * Run all test suites
     */
    async function runAllTests() {
        stats = {
            total: 0,
            passed: 0,
            failed: 0,
            suites: []
        };
        
        const container = document.getElementById('testSuites');
        container.innerHTML = '';
        
        for (const suite of testSuites) {
            await runSuite(suite);
        }
        
        updateStats();
        return stats;
    }
    
    /**
     * Run a single test suite
     */
    async function runSuite(suite) {
        const suiteResults = {
            name: suite.name,
            passed: 0,
            failed: 0,
            tests: []
        };
        
        // Create suite UI
        const suiteElement = createSuiteElement(suite.name);
        document.getElementById('testSuites').appendChild(suiteElement);
        const resultsContainer = suiteElement.querySelector('.test-results');
        
        try {
            // Run beforeAll hook
            if (suite.beforeAll) {
                await suite.beforeAll();
            }
            
            // Run each test
            for (const test of suite.tests) {
                // Run beforeEach hook
                if (suite.beforeEach) {
                    await suite.beforeEach();
                }
                
                // Run test
                const testResult = await runTest(test);
                suiteResults.tests.push(testResult);
                
                // Update UI
                const testElement = createTestElement(test.name, testResult.passed, testResult.error);
                resultsContainer.appendChild(testElement);
                
                // Update stats
                stats.total++;
                if (testResult.passed) {
                    stats.passed++;
                    suiteResults.passed++;
                } else {
                    stats.failed++;
                    suiteResults.failed++;
                }
                
                // Run afterEach hook
                if (suite.afterEach) {
                    await suite.afterEach();
                }
                
                // Update progress
                updateProgress();
            }
            
            // Run afterAll hook
            if (suite.afterAll) {
                await suite.afterAll();
            }
        } catch (error) {
            console.error(`Error in suite ${suite.name}:`, error);
        }
        
        // Update suite header
        const header = suiteElement.querySelector('.suite-header');
        header.classList.add(suiteResults.failed > 0 ? 'failed' : 'passed');
        header.innerHTML = `${suite.name} (${suiteResults.passed}/${suite.tests.length} passed)`;
        
        stats.suites.push(suiteResults);
    }
    
    /**
     * Run a single test
     */
    async function runTest(test) {
        const result = {
            name: test.name,
            passed: false,
            error: null
        };
        
        try {
            await test.fn();
            result.passed = true;
        } catch (error) {
            result.error = error.message || error.toString();
        }
        
        return result;
    }
    
    /**
     * Create suite DOM element
     */
    function createSuiteElement(name) {
        const suite = document.createElement('div');
        suite.className = 'test-suite';
        
        const header = document.createElement('div');
        header.className = 'suite-header';
        header.textContent = name;
        header.onclick = () => {
            const results = suite.querySelector('.test-results');
            results.classList.toggle('show');
        };
        
        const results = document.createElement('div');
        results.className = 'test-results show';
        
        suite.appendChild(header);
        suite.appendChild(results);
        
        return suite;
    }
    
    /**
     * Create test DOM element
     */
    function createTestElement(name, passed, error) {
        const test = document.createElement('div');
        test.className = `test ${passed ? 'pass' : 'fail'}`;
        
        const testName = document.createElement('div');
        testName.className = 'test-name';
        testName.textContent = `${passed ? '✓' : '✗'} ${name}`;
        test.appendChild(testName);
        
        if (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'test-error';
            errorDiv.textContent = error;
            test.appendChild(errorDiv);
        }
        
        return test;
    }
    
    /**
     * Update statistics display
     */
    function updateStats() {
        document.getElementById('totalTests').textContent = stats.total;
        document.getElementById('passedTests').textContent = stats.passed;
        document.getElementById('failedTests').textContent = stats.failed;
        
        const coverage = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
        document.getElementById('coverage').textContent = `${coverage}%`;
    }
    
    /**
     * Update progress bar
     */
    function updateProgress() {
        const progress = stats.total > 0 ? (stats.passed + stats.failed) / testSuites.reduce((sum, s) => sum + s.tests.length, 0) * 100 : 0;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }
    
    /**
     * Clear test results
     */
    function clearResults() {
        document.getElementById('testSuites').innerHTML = '';
        stats = {
            total: 0,
            passed: 0,
            failed: 0,
            suites: []
        };
        updateStats();
        updateProgress();
    }
    
    /**
     * Export test results
     */
    function exportResults() {
        const report = {
            timestamp: new Date().toISOString(),
            stats: stats,
            suites: stats.suites
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Initialize test runner
     */
    function init() {
        document.getElementById('runAllTests').addEventListener('click', runAllTests);
        document.getElementById('clearResults').addEventListener('click', clearResults);
        document.getElementById('exportResults').addEventListener('click', exportResults);
        
        // Auto-run tests on load
        setTimeout(() => {
            runAllTests();
        }, 100);
    }
    
    // Public API
    return {
        describe,
        it,
        beforeEach,
        afterEach,
        beforeAll,
        afterAll,
        expect,
        runAllTests,
        init
    };
})();

// Global exports for test files
const { describe, it, beforeEach, afterEach, beforeAll, afterAll, expect } = TestRunner;