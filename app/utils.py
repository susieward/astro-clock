
def create_metaclass(base_class, subclass):
    method_dict = {f'{k}': v for k,v in subclass.__dict__.items() if callable(v) and v.__name__ != '__init__'}

    return type(f'_{subclass.__name__}', (base_class,), method_dict)


def create_metaclasses(base_class, subclasses):
    classes = [create_metaclass(base_class, s) for s in subclasses]
    return classes
