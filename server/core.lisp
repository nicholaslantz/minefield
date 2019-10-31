(ql:quickload '(:hunchentoot :cl-who :jsown))

(defpackage :core
  (:use :cl :cl-who :hunchentoot :jsown))

(in-package :core)

(defconstant +chunk-size+ 16)
(defconstant +mine-probability+ (/ 2 10))

(defun uniform ()
  "Get a random number in [0, 1)"
  (let ((m (expt 2 31)))
    (/ (random m) m)))

(defclass chunk ()
  ((id :reader id
       :initarg :id)
   (mines :reader mines
	  :initform
	  (make-array +chunk-size+
		      :initial-contents (loop repeat +chunk-size+
					   collect (< (uniform) +mine-probability+))))
   (actions :accessor actions
	    :initform '())))

(defvar *chunks* '())
