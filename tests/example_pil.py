from PIL import Image

# Open an image
img = Image.open("corgi.png")

img.show()

# Convert to grayscale (mode 'L')
img_gray = img.convert('L')
img_gray.show()

if True:
    def first(alpha: int) -> str:
        beta = str(alpha)

        def third(apple: int) -> int:
            corn = apple + alpha
            return corn

        third(5)
        return beta


    def second(gamma: list, alpha: str) -> str:
        delta = first(int(gamma[0]))
        if True:
            alpha = first(int(delta)) + alpha
        else:
            banana = 100
            print(banana)
        for gamma_item in gamma:
            epsilon = gamma_item + gamma_item
        return str(epsilon) + alpha


    second([1, 2, 3, 4], "Hello")
    second(["0", "1", "2", "3"], "World")
else:
    other_side = 100
    print(other_side)
from pedal import MAIN_REPORT
from pprint import pprint


# gently("Hello World" * 110, title="A super long title that will try to wrap offscreen; just need it to go a little further!")

def print_trace(state, indent=2):
    yield " " * indent + repr(state) + " -- " + str(state.name) + " -- " + str(state.position)
    for child in state.trace:
        for result in print_trace(child, indent + 2):
            yield result

# tifa = MAIN_REPORT._tool_data['tifa']['instance']
# for k, v in vars(tifa).items():
#    print(k, repr(v))
# print(tifa.path_names)

# for path_id, states in tifa.name_map.items():
#    for name, state in states.items():
#        print(path_id, name, repr(state), "\n" + "\n".join(print_trace(state)))
# console_log(MAIN_REPORT._tool_data['tifa']['instance'])