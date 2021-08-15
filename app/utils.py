
def create_metaclass(base_class, subclass):
    return type(f'_{subclass.__name__}', (base_class,), {})


def create_metaclasses(base_class, subclasses):
    return [create_metaclass(base_class, s) for s in subclasses]
