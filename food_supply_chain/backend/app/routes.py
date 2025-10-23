from flask import Blueprint, request, jsonify

routes = Blueprint("routes", __name__)

@routes.route("/farmer/register-crop", methods=["POST"])
def register_crop():
    crop_name = request.form.get("crop_name")
    quantity = request.form.get("quantity")
    days_to_deliver = request.form.get("days_to_deliver")
    image = request.files.get("image")

    # For now, just log the data
    print("Received crop:", crop_name, quantity, days_to_deliver, image.filename if image else "No image")

    return jsonify({"message": "Crop registered successfully!"})
