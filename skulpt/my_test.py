class TestClass():
    def __getattr__(self, key):
        if key == 't':
            return 5
        raise AttributeError(item)
t = TestClass()
print(t.t)
print(t.x)