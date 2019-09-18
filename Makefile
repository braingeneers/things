build:
	# Build custom docker image
	docker build -t $(USER)-braingeneers-iot

debug:
	# Run our image with the local version of the app and shell into it
	docker run -it --rm \
		-v `pwd`:/app \
		--user=`id -u`:`id -g` \
		--entrypoint /bin/sh \
		$(USER)-braingeneers-iot

run:
	# Run the image in a container locally
	docker run -it --rm \
		$(USER)-braingeneers-iot

push:
	# Push our image to dockerhub for running in k8s
	docker tag $(USER)-ubuntu $(DOCKERHUB_ACCOUNT)/ubuntu
	docker push $(DOCKERHUB_ACCOUNT)/ubuntu

list-things:
	aws --profile braingeneers-administrator iot list-things
